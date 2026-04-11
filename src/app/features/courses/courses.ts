import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { Category, Course, CoursesMeta, Instructor, Topic } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { Loader } from '../../shared/components/loader/loader';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Pagination } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-courses',
  imports: [Loader, Pagination],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected courses = signal<Course[]>([]);
  protected meta = signal<CoursesMeta | null>(null);
  protected currentPage = signal(1);
  protected isLoadingCourses = signal(false);

  protected categories = signal<Category[]>([]);
  protected selectedCategories = signal<number[]>([]);

  protected topics = signal<Topic[]>([]);
  protected selectedTopics = signal<number[]>([]);

  protected instructors = signal<Instructor[]>([]);
  protected selectedInstructors = signal<number[]>([]);

  protected lastPage = computed(() => this.meta()?.lastPage ?? 1);

  async ngOnInit() {
    const params = await firstValueFrom(this.route.queryParams);

    const parseIds = (param: string | undefined): number[] => {
      if (!param) return [];
      return param
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n));
    };

    this.currentPage.set(Number(params['page']) || 1);
    this.selectedCategories.set(parseIds(params['categories']));
    this.selectedTopics.set(parseIds(params['topics']));
    this.selectedInstructors.set(parseIds(params['instructors']));

    await this.init();
  }

  private async init() {
    await Promise.all([
      this.loadCategories(),
      this.loadTopics(),
      this.loadInstructors(),
      this.loadCourses(),
    ]);
  }

  private updateUrl() {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage() > 1 ? this.currentPage() : null,
        categories:
          this.selectedCategories().length > 0 ? this.selectedCategories().join(',') : null,
        topics: this.selectedTopics().length > 0 ? this.selectedTopics().join(',') : null,
        instructors:
          this.selectedInstructors().length > 0 ? this.selectedInstructors().join(',') : null,
      },
      replaceUrl: true,
    });
  }

  private async loadCategories() {
    try {
      const categories = await this.coursesService.getCategories();
      this.categories.set(categories);
    } catch {
      this.notyService.showError('Failed to load categories');
    }
  }

  private async loadCourses() {
    this.isLoadingCourses.set(true);
    try {
      const res = await this.coursesService.getCourses(this.currentPage(), {
        categories: this.selectedCategories(),
        topics: this.selectedTopics(),
        instructors: this.selectedInstructors(),
      });
      this.courses.set(res.data);
      this.meta.set(res.meta);
    } catch {
      this.notyService.showError('Failed to load courses');
    } finally {
      this.isLoadingCourses.set(false);
    }
  }

  private async loadInstructors() {
    try {
      const instructors = await this.coursesService.getInstructors();
      this.instructors.set(instructors);
    } catch {
      this.notyService.showError('Failed to load instructors');
    }
  }
  protected async toggleInstructor(id: number) {
    this.selectedInstructors.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );

    this.currentPage.set(1);
    await this.loadCourses();
    this.updateUrl();
  }
  protected async toggleCategory(id: number) {
    const next = this.selectedCategories().includes(id)
      ? this.selectedCategories().filter((i) => i !== id)
      : [...this.selectedCategories(), id];

    this.selectedCategories.set(next);
    this.currentPage.set(1);

    await this.loadTopics(next);

    const validTopicIds = new Set(this.topics().map((t) => t.id));

    this.selectedTopics.update((ids) => ids.filter((id) => validTopicIds.has(id)));

    await this.loadCourses();
    this.updateUrl();
  }
  private async loadTopics(categoryIds: number[] = []) {
    try {
      const topics = await this.coursesService.getTopics(categoryIds);
      this.topics.set(topics);
    } catch {
      this.notyService.showError('Failed to load topics');
    }
  }

  protected async toggleTopic(id: number) {
    this.selectedTopics.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
    this.currentPage.set(1);
    await this.loadCourses();
    this.updateUrl();
  }

  protected async clearAllFilters() {
    this.selectedCategories.set([]);
    this.selectedTopics.set([]);
    this.selectedInstructors.set([]);
    this.currentPage.set(1);
    await this.loadTopics();
    await this.loadCourses();
    this.updateUrl();
  }

  protected async goToPage(page: number) {
    this.currentPage.set(page);
    await this.loadCourses();
    this.updateUrl();
  }

  protected relevantInstructors = computed(() => {
    if (this.selectedCategories().length === 0 && this.selectedTopics().length === 0) {
      return this.instructors();
    }
    const relevantIds = new Set(this.courses().map((c) => c.instructor.id));
    return this.instructors().filter((i) => relevantIds.has(i.id));
  });
}
