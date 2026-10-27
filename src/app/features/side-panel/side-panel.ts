import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { EnrolledCourse } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { Loader } from '../../shared/components/loader/loader';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../core/services/modal.service';
import { formatName, formatTimeSlotLabel } from '../../shared/utils/format.utils';

@Component({
  selector: 'app-side-panel',
  imports: [IconLibrary, Loader, RouterLink],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.css',
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class SidePanel implements OnInit, OnDestroy {
  private readonly courseService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);
  protected isLoadingCourses = signal(false);
  protected enrolledCourses = signal<EnrolledCourse[]>([]);
  protected formatName = formatName;
  protected formatTimeSlotLabel = formatTimeSlotLabel;

  ngOnInit() {
    this.loadCourses();

    document.documentElement.style.overflow = 'hidden';
  }
  ngOnDestroy() {
    document.documentElement.style.overflow = '';
  }
  protected close() {
    this.modalService.closeSidePanel();
  }
  private async loadCourses() {
    this.isLoadingCourses.set(true);
    try {
      this.enrolledCourses.set(await this.courseService.getCoursesInProgress());
    } catch {
      this.notyService.showError('Failed to load featured courses');
    } finally {
      this.isLoadingCourses.set(false);
    }
  }
}
