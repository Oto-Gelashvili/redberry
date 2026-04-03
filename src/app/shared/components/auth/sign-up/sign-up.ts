import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  closeModal = output<void>();
  signUpForm = new FormGroup({
    email: new FormControl<string>('you@example.com', [Validators.required, Validators.email]),
    username: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
    avatar: new FormControl('', [Validators.pattern(/\.(jpg|jpeg|png|webp)$/i)]),
  });

  steps = signal(1);

  onClose() {
    this.steps.set(1);
    this.closeModal.emit();
  }
  onSubmit() {
    if (this.steps() === 3) {
      console.log('submit');
    } else {
      this.steps.update((v) => v + 1);
    }
  }
}
