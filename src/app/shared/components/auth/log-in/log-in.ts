import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { IconLibrary } from '../../icon-library/icon-library';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, IconLibrary],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  private readonly authService = inject(AuthService);

  protected closeModal = output<void>();
  protected closeModalSignUp = output<void>();
  protected passwordVisible = signal(false);

  protected isLoading = signal(false);
  protected serverErrors = signal<Record<string, string[]>>({});
  protected generalError = signal<string | null>(null);

  protected logInForm = new FormGroup({
    email: new FormControl<string>('you@example.com', [Validators.required, Validators.email]),
    password: new FormControl<string>('Redberry', [Validators.required, Validators.minLength(3)]),
  });

  //close and reset modal
  protected onClose(type: string) {
    if (type === 'signUp') {
      this.closeModalSignUp.emit();
    }
    if (type === 'close') {
      this.closeModal.emit();
    }
  }

  //password display
  protected togglePassword() {
    this.passwordVisible.update((v) => !v);
  }

  //btn disabled logic
  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;

    const form = this.logInForm;

    return form.invalid;
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
    // const v = this.logInForm.value;
    // const formData = new FormData();
    // formData.append('email', v.email!);
    // formData.append('password', v.password!);

    // this.isLoading.set(true);
    // this.serverErrors.set({});
    // this.generalError.set(null);

    // try {
    //   const res = await this.authService.register(formData);
    //   this.authService.setSession(res.data.user, res.data.token);
    //   this.onClose();
    // } catch (err: any) {
    //   if (err.status === 422) {
    //     const errors = err.error.errors ?? {};
    //     this.serverErrors.set(errors);

    //     if (errors['email']) {
    //       this.steps.set(1);
    //     } else if (errors['username']) {
    //       this.steps.set(3);
    //     }
    //   } else {
    //     this.generalError.set('Something went wrong. Please try again.');
    //   }
    // } finally {
    //   this.isLoading.set(false);
    // }
    console.log('submit');
  }
}
