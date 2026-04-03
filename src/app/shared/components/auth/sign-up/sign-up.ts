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
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragging = signal(false);
  steps = signal(1);

  signUpForm = new FormGroup({
    email: new FormControl<string>('you@example.com', [Validators.required, Validators.email]),
    username: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
    avatar: new FormControl(''),
  });

  //close and reset modal
  onClose() {
    this.steps.set(1);
    this.closeModal.emit();
  }

  //back arrow
  decreaseStep() {
    this.steps.update((v) => v - 1);
  }

  //password display
  togglePassword() {
    this.passwordVisible.update((v) => !v);
  }
  toggleConfirmPassword() {
    this.confrimPasswordVisible.update((v) => !v);
  }

  //btn disabled logic
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

  //avatar
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.setFile(file);
  }

  private setFile(file: File) {
    if (!file) return;

    const control = this.signUpForm.get('avatar');
    const maxSize = 2 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      control?.setErrors({ incorrectFormat: true });
      return;
    }
    if (file.size > maxSize) {
      control?.setErrors({ tooLarge: true });
      return;
    }
    control?.setErrors(null);

    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    control?.setValue(file.name);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.setFile(files[0]);
    }
  }
  //submit
  onSubmit() {
    if (this.steps() === 3) {
      console.log('submit');
    } else {
      this.steps.update((v) => v + 1);
    }
  }
}
