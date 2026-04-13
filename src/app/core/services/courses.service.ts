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

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly authService = inject(AuthService);

  async getFeaturedCourses(): Promise<Course[]> {
    const res = await fetch(`${BASE_URL}/courses/featured`);
    const json = await res.json();
    return json.data as Course[];
  }
  async getCoursesInProgress(): Promise<EnrolledCourse[]> {
    const res = await fetch(`${BASE_URL}/courses/in-progress`, {
      headers: { Authorization: `Bearer ${this.authService.token()}` },
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as EnrolledCourse[];
  }
  async getEnrolledCourses(): Promise<EnrolledCourse[]> {
    const res = await fetch(`${BASE_URL}/enrollments`, {
      headers: { Authorization: `Bearer ${this.authService.token()}` },
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as EnrolledCourse[];
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
    const params = new URLSearchParams();
    params.set('page', String(page));

    filters.categories?.forEach((id) => params.append('categories[]', String(id)));
    filters.topics?.forEach((id) => params.append('topics[]', String(id)));
    filters.instructors?.forEach((id) => params.append('instructors[]', String(id)));
    if (filters.sort) {
      params.set('sort', filters.sort);
    }

    const res = await fetch(`${BASE_URL}/courses?${params.toString()}`);
    const json = await res.json();

    if (!res.ok) throw { status: res.status, error: json };
    return json as CoursesResponse;
  }
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    const json = await res.json();
    return json.data as Category[];
  }
  async getTopics(categoryIds: number[] = []): Promise<Topic[]> {
    const params = new URLSearchParams();
    categoryIds.forEach((id) => params.append('categories[]', String(id)));
    const url =
      categoryIds.length > 0 ? `${BASE_URL}/topics?${params.toString()}` : `${BASE_URL}/topics`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data as Topic[];
  }
  async getInstructors(): Promise<Instructor[]> {
    const res = await fetch(`${BASE_URL}/instructors`);
    const json = await res.json();
    return json.data as Instructor[];
  }
  async getCourseById(id: number): Promise<CourseSingle> {
    const res = await fetch(`${BASE_URL}/courses/${id}`);
    const json = await res.json();

    if (!res.ok) throw json;

    return json.data as CourseSingle;
  }
}
