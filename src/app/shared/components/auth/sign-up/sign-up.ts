import { Component, output } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  imports: [],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  closeModal = output<void>();

  onClose() {
    this.closeModal.emit();
  }
}
