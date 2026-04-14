import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CoursesService } from '../../core/services/courses.service';
import { NotificationService } from '../../core/services/notification.service';
import { Loader } from '../../shared/components/loader/loader';
import { CourseSingle } from '../../models/courses.model';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { EnrollSection } from './components/enroll-section/enroll-section';

@Component({
  selector: 'app-course-details',
  imports: [Loader, IconLibrary, RouterLink, EnrollSection],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  private route = inject(ActivatedRoute);
  private readonly coursesService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);

  protected courseId = signal<number | null>(null);
  protected course = signal<CourseSingle | null>(null);
  protected isLoading = signal(true);
  private currentId: number | null = null;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(async (params) => {
      const id = Number(params.get('id'));
      if (id === this.currentId) return;
      this.currentId = id;
      this.courseId.set(id);
      this.isLoading.set(true);

      try {
        const course = await this.coursesService.getCourseById(id);
        this.course.set(course);
      } catch {
        this.notyService.showError('Failed to load course');
      } finally {
        this.isLoading.set(false);
      }
    });
  }
  protected averageRating = computed(() => {
    const reviews = this.course()?.reviews;
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  });

  protected async reloadCourse() {
    if (!this.courseId()) return;

    const updated = await this.coursesService.getCourseById(this.courseId()!);
    this.course.set(updated);
  }
}
