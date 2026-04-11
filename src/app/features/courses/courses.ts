import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { Category, Course, CoursesMeta, Instructor, Topic } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { Loader } from '../../shared/components/loader/loader';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-courses',
  imports: [Loader],
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
  protected visiblePages = computed(() => {
    const current = this.currentPage();
    const last = this.lastPage();
    const pages: (number | 'dots-left' | 'dots-right')[] = [];

    if (last <= 5) {
      for (let i = 1; i <= last; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current <= 3) {
      pages.push(2, 3);
      if (current === 3) pages.push(4);
      pages.push('dots-right');
    } else if (current >= last - 2) {
      pages.push('dots-left');
      if (current === last - 2) pages.push(last - 3);
      pages.push(last - 2, last - 1);
    } else {
      pages.push('dots-left');
      pages.push(current - 1, current, current + 1);
      pages.push('dots-right');
    }
    pages.push(last);
    return pages;
  });

  protected editingDots = signal<'left' | 'right' | null>(null);
  protected dotsInputValue = signal('');

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
    if (page < 1 || page > this.lastPage() || page === this.currentPage()) return;
    this.currentPage.set(page);
    await this.loadCourses();
    this.updateUrl();
  }

  protected onDotsClick(side: 'left' | 'right') {
    this.editingDots.set(side);
    this.dotsInputValue.set('');
  }

  protected onDotsInputKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const page = Number(this.dotsInputValue());
      if (Number.isInteger(page)) {
        this.goToPage(page);
      }
      this.editingDots.set(null);
    }
    if (event.key === 'Escape') {
      this.editingDots.set(null);
    }
  }

  protected onDotsInputBlur() {
    this.editingDots.set(null);
  }
  protected relevantInstructors = computed(() => {
    if (this.selectedCategories().length === 0 && this.selectedTopics().length === 0) {
      return this.instructors();
    }
    const relevantIds = new Set(this.courses().map((c) => c.instructor.id));
    return this.instructors().filter((i) => relevantIds.has(i.id));
  });
}
