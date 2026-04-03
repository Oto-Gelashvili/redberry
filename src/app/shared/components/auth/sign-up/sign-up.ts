import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconLibrary } from '../../icon-library/icon-library';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, IconLibrary],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  closeModal = output<void>();
  passwordVisible = signal(true);
  confrimPasswordVisible = signal(false);
  signUpForm = new FormGroup({
    email: new FormControl<string>('you@example.com', [Validators.required, Validators.email]),
    username: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl<string>('Password', [Validators.required, Validators.minLength(3)]),
    confirmPassword: new FormControl<string>('Password', [Validators.required]),
    avatar: new FormControl('', [Validators.pattern(/\.(jpg|jpeg|png|webp)$/i)]),
  });

  steps = signal(1);

  onClose() {
    this.steps.set(1);
    this.closeModal.emit();
  }
  togglePassword() {
    this.passwordVisible.update((v) => !v);
  }
  toggleConfirmPassword() {
    this.confrimPasswordVisible.update((v) => !v);
  }

  getIsBtnDisabled(): boolean {
    const step = this.steps();
    const form = this.signUpForm;

    if (step === 1) {
      return !!form.get('email')?.invalid;
    }

    if (step === 2) {
      const passwordControl = form.get('password');
      const confirmControl = form.get('confirmPassword');

      const invalidPass = !!passwordControl?.invalid;
      const passwordsDontMatch =
        !confirmControl?.value || confirmControl.value !== passwordControl?.value;

      return invalidPass || passwordsDontMatch;
    }

    return form.invalid;
  }
  onSubmit() {
    if (this.steps() === 3) {
      console.log('submit');
    } else {
      this.steps.update((v) => v + 1);
    }
  }
}
