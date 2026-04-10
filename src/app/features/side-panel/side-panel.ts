import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { EnrolledCourse } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { Loader } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-side-panel',
  imports: [IconLibrary, Loader],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel implements OnInit, OnDestroy {
  private readonly courseService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);
  protected isLoadingCourses = signal(false);
  protected enrolledCourses = signal<EnrolledCourse[]>([]);

  ngOnInit() {
    this.loadCourses();

    document.documentElement.style.overflow = 'hidden';
  }
  ngOnDestroy() {
    document.documentElement.style.overflow = '';
  }

  private async loadCourses() {
    this.isLoadingCourses.set(true);
    try {
      const courses = await this.courseService.getEnrolledCourses();
      const inProgress = courses.filter((course) => course.progress < 100);
      this.enrolledCourses.set(inProgress);
    } catch {
      this.notyService.showError('Failed to load featured courses');
    } finally {
      this.isLoadingCourses.set(true);
    }
  }
}
