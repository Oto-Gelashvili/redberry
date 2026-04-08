import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { IconLibrary } from '../../../shared/components/icon-library/icon-library';
import { Loader } from '../../../shared/components/loader/loader';
import { ImgUploader } from '../../../shared/components/img-uploader/img-uploader';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, IconLibrary, Loader, ImgUploader],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private readonly authService = inject(AuthService);
  protected readonly modalService = inject(ModalService);

  protected selectedFile = signal<File | null>(null);
  protected passwordVisible = signal(true);
  protected confrimPasswordVisible = signal(false);
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
  protected onFileSelected(file: File) {
    this.selectedFile.set(file);
    const control = this.signUpForm.get('avatar');
    control?.setErrors(null);
    control?.setValue(file.name);
  }

  protected onFileError(error: 'incorrectFormat' | 'tooLarge') {
    const control = this.signUpForm.get('avatar');
    control?.setErrors({ [error]: true });
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
      this.modalService.closeAll();
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
