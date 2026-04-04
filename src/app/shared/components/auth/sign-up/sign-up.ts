import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconLibrary } from '../../icon-library/icon-library';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, IconLibrary],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private readonly authService = inject(AuthService);

  protected closeModal = output<void>();
  protected closeModalLogIn = output<void>();
  protected passwordVisible = signal(true);
  protected confrimPasswordVisible = signal(false);
  protected selectedFile = signal<File | null>(null);
  protected previewUrl = signal<string | null>(null);
  protected isDragging = signal(false);
  protected steps = signal(1);

  protected isLoading = signal(false);
  protected serverErrors = signal<Record<string, string[]>>({});
  protected generalError = signal<string | null>(null);

  protected signUpForm = new FormGroup({
    email: new FormControl<string>('you@example.com', [Validators.required, Validators.email]),
    username: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
    avatar: new FormControl(''),
  });

  //close and reset modal
  protected onClose(type: string) {
    this.steps.set(1);

    if (type === 'logIn') {
      this.closeModalLogIn.emit();
    }
    if (type === 'close') {
      this.closeModal.emit();
    }
  }

  //back arrow
  protected decreaseStep() {
    this.steps.update((v) => v - 1);
  }

  //password display
  protected togglePassword() {
    this.passwordVisible.update((v) => !v);
  }
  protected toggleConfirmPassword() {
    this.confrimPasswordVisible.update((v) => !v);
  }

  //btn disabled logic
  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;

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
  protected onFileSelected(event: any) {
    const file = event.target.files[0];
    this.setFile(file);
  }

  private setFile(file: File) {
    if (!file) return;

    const control = this.signUpForm.get('avatar');
    const maxSize = 1024 * 1024;
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

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.setFile(files[0]);
    }
  }

  //clear server error on input chnage
  protected clearServerError(field: string) {
    if (this.serverErrors()[field]) {
      this.serverErrors.update((errors) => {
        const updated = { ...errors };
        delete updated[field];
        return updated;
      });
    }
  }
  //submit
  protected async onSubmit() {
    if (this.steps() < 3) {
      this.steps.update((v) => v + 1);
      return;
    }

    const v = this.signUpForm.value;
    const formData = new FormData();
    formData.append('username', v.username!);
    formData.append('email', v.email!);
    formData.append('password', v.password!);
    formData.append('password_confirmation', v.confirmPassword!);
    if (this.selectedFile()) {
      formData.append('avatar', this.selectedFile()!);
    }

    this.isLoading.set(true);
    this.serverErrors.set({});
    this.generalError.set(null);

    try {
      const res = await this.authService.register(formData);
      this.authService.setSession(res.data.user, res.data.token);
      this.onClose('close');
    } catch (err: any) {
      if (err.status === 422) {
        const errors = err.error.errors ?? {};
        this.serverErrors.set(errors);

        if (errors['email']) {
          this.steps.set(1);
        } else if (errors['username']) {
          this.steps.set(3);
        }
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
