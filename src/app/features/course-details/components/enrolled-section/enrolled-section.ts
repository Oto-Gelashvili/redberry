import { Component, inject, input, output, signal } from '@angular/core';
import { EnrolledCourse } from '../../../../models/courses.model';
import { formatName, formatTimeSlotLabel } from '../../../../shared/utils/format.utils';
import { IconLibrary } from '../../../../shared/components/icon-library/icon-library';
import { EnrollService } from '../../../../core/services/enroll.service';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Loader } from '../../../../shared/components/loader/loader';

@Component({
  selector: 'app-enrolled-section',
  imports: [IconLibrary, Loader],
  templateUrl: './enrolled-section.html',
  styleUrl: './enrolled-section.css',
})
export class EnrolledSection {
  private readonly enrollService = inject(EnrollService);
  protected readonly modalService = inject(ModalService);
  protected readonly notyService = inject(NotificationService);
  readonly courseTitle = input.required<string>();
  readonly data = input.required<EnrolledCourse>();
  protected formatName = formatName;
  protected formatTimeSlotLabel = formatTimeSlotLabel;
  protected isSubmitting = signal(false);
  refresh = output<void>();

  async onSubmit() {
    if (this.isSubmitting()) return;
    try {
      this.isSubmitting.set(true);
      if (this.data().completedAt) {
        await this.enrollService.retakeCourse(this.data().id);
        this.notyService.showSuccess('Course can be retaken again');
      } else {
        await this.enrollService.completeCourse(this.data().id);
        this.modalService.openEnrollmentModal({
          type: 'completed',
          title: 'Congratulations!',
          icon: 'congrats.svg',
          courseTitle: this.courseTitle(),
        });
      }

      this.refresh.emit();
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        this.modalService.openSignUp();
        this.notyService.showError('You need to be authenticated');
        return;
      }

      if (error.status === 404) {
        this.notyService.showError('No query results for model.');
        return;
      } else {
        this.notyService.showError('Server error, try again');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
