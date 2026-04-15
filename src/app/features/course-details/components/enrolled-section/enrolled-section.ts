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

  readonly data = input.required<EnrolledCourse>();
  protected formatName = formatName;
  protected formatTimeSlotLabel = formatTimeSlotLabel;
  protected isSubmitting = signal(false);
  completed = output<void>();

  async onSubmit() {
    if (this.isSubmitting()) return;

    try {
      this.isSubmitting.set(true);
      await this.enrollService.completeCourse(this.data().id);
      this.completed.emit();
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
        this.notyService.showError('Failed to complete course');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
