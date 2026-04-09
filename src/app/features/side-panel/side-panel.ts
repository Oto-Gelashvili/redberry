import { Component, inject, OnInit, signal } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { EnrolledCourse } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-side-panel',
  imports: [],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
})
export class SidePanel implements OnInit {
  private readonly courseService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);
  protected isLoadingCourses = signal(false);
  protected enrolledCourses = signal<EnrolledCourse[]>([]);

  ngOnInit() {
    this.loadCourses();
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
      this.isLoadingCourses.set(false);
    }
  }
}
