import { Component, inject, input, signal } from '@angular/core';
import { EnrollmentModalData } from '../../../models/courses.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-enrollment-modal',
  imports: [],
  templateUrl: './enrollment-modal.html',
  styleUrl: './enrollment-modal.css',
})
export class EnrollmentModal {
  protected readonly modalService = inject(ModalService);
  readonly data = input.required<EnrollmentModalData>();

  onContinue() {
    this.modalService.closeEnrollmentModal(true);
  }

  onCancel() {
    this.modalService.closeEnrollmentModal(false);
  }
}
