import { Component, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CoursesService } from '../../core/services/courses.service';
import { Course } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-course-details',
  imports: [Loader],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  private route = inject(ActivatedRoute);
  private readonly coursesService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);

  protected courseId = signal<number | null>(null);
  protected course = signal<Course | null>(null);
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
}
