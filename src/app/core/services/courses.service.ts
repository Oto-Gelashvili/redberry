import { inject, Injectable } from '@angular/core';
import {
  Category,
  Course,
  CourseSingle,
  CoursesResponse,
  EnrolledCourse,
  Instructor,
  Topic,
} from '../../models/courses.model';
import { AuthService } from './auth.service';
import { supabase } from './supabase';
import { COURSE_SELECT, ENROLLMENT_SELECT, mapCourse, mapEnrollment, mapTopic } from './mappers';

const PER_PAGE = 12;

const SORTS: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  price_asc: { column: 'base_price', ascending: true },
  price_desc: { column: 'base_price', ascending: false },
  popular: { column: 'review_count', ascending: false }, // switch to enrollments later
  title_asc: { column: 'title', ascending: true },
};

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly authService = inject(AuthService);

  async getFeaturedCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(COURSE_SELECT)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw { status: 400, error };
    return (data as any[]).map(mapCourse);
  }

  async getCourses(
    page: number = 1,
    filters: {
      categories?: number[];
      topics?: number[];
      instructors?: number[];
      sort?: string;
    } = {},
  ): Promise<CoursesResponse> {
    const from = (page - 1) * PER_PAGE;
    const sort = SORTS[filters.sort ?? ''] ?? SORTS['newest'];

    let query = supabase.from('courses').select(COURSE_SELECT, { count: 'exact' });

    if (filters.categories?.length) query = query.in('category_id', filters.categories);
    if (filters.topics?.length) query = query.in('topic_id', filters.topics);
    if (filters.instructors?.length) query = query.in('instructor_id', filters.instructors);

    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.ascending })
      .order('id', { ascending: true }) // stable order across pages
      .range(from, from + PER_PAGE - 1);

    if (error) {
      // page number beyond the last page (e.g. from an old URL) -> fall back to page 1
      if (error.code === 'PGRST103' && page > 1) return this.getCourses(1, filters);
      throw { status: 400, error };
    }

    const total = count ?? 0;
    return {
      data: (data as any[]).map(mapCourse),
      meta: {
        currentPage: page,
        lastPage: Math.max(1, Math.ceil(total / PER_PAGE)),
        perPage: PER_PAGE,
        total,
      },
    };
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('name');
    if (error) throw { status: 400, error };
    return data as Category[];
  }

  async getTopics(categoryIds: number[] = []): Promise<Topic[]> {
    let query = supabase.from('topics').select('id, name, category_id').order('name');
    if (categoryIds.length) query = query.in('category_id', categoryIds);

    const { data, error } = await query;
    if (error) throw { status: 400, error };
    return (data as any[]).map(mapTopic);
  }

  async getInstructors(): Promise<Instructor[]> {
    const { data, error } = await supabase
      .from('instructors')
      .select('id, name, avatar')
      .order('name');
    if (error) throw { status: 400, error };
    return data as Instructor[];
  }

  async getCourseById(id: number): Promise<CourseSingle> {
    const { data, error } = await supabase
      .from('courses')
      .select(`${COURSE_SELECT}, reviews(user_id, rating)`)
      .eq('id', id)
      .maybeSingle();

    if (error) throw { status: 400, message: error.message };
    if (!data) throw { status: 404, message: 'Course not found' };

    // Read the session directly: authService.user() may not be loaded yet right after a page refresh
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    const reviews = (data.reviews as any[]).map((r) => ({ userId: r.user_id, rating: r.rating }));

    let enrollment: EnrolledCourse | undefined;
    if (userId) {
      const { data: e } = await supabase
        .from('enrollments')
        .select(ENROLLMENT_SELECT)
        .eq('course_id', id)
        .maybeSingle();
      if (e) enrollment = mapEnrollment(e);
    }

    return {
      ...mapCourse(data),
      reviews,
      isRated: !!userId && reviews.some((r) => r.userId === userId),
      enrollment,
    };
  }

  async getEnrolledCourses(): Promise<EnrolledCourse[]> {
    return this.loadEnrollments(false);
  }

  async getCoursesInProgress(): Promise<EnrolledCourse[]> {
    return this.loadEnrollments(true);
  }
  private async loadEnrollments(onlyInProgress: boolean): Promise<EnrolledCourse[]> {
    if (!this.authService.isAuthenticated())
      throw { status: 401, error: { message: 'Unauthenticated' } };

    let query = supabase
      .from('enrollments')
      .select(ENROLLMENT_SELECT)
      .order('created_at', { ascending: false });
    if (onlyInProgress) query = query.is('completed_at', null);

    const { data, error } = await query;
    if (error) throw { status: 400, error };
    return (data as any[]).map(mapEnrollment);
  }
}
