import { Component, inject, input, signal } from '@angular/core';
import { EnrollmentModalData } from '../../../models/courses.model';
import { ModalService } from '../../../core/services/modal.service';
import { Rater } from '../rater/rater';
import { formatTimeSlotLabel } from '../../utils/format.utils';
import { EnrollService } from '../../../core/services/enroll.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-enrollment-modal',
  imports: [Rater],
  templateUrl: './enrollment-modal.html',
  styleUrl: './enrollment-modal.css',
})
export class EnrollmentModal {
  protected readonly modalService = inject(ModalService);
  protected readonly enrollService = inject(EnrollService);
  protected readonly notyService = inject(NotificationService);
  readonly data = input.required<EnrollmentModalData>();
  protected formatTimeSlotLabel = formatTimeSlotLabel;
  protected rating = signal(0);

  onContinue() {
    this.modalService.closeEnrollmentModal(true);
  }

  async close() {
    if (this.data().type === 'completed' && this.rating() > 0) {
      try {
        await this.enrollService.submitReview(this.data().courseId!, this.rating());
        this.notyService.showSuccess('Rating Submitted');
      } catch {
        this.notyService.showError('Failed to submit review');
      }
    }
    this.modalService.closeEnrollmentModal(false);
  }

  showProfile() {
    this.modalService.closeEnrollmentModal(false);
    this.modalService.openProfile();
  }
}
