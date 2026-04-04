import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { IconLibrary } from '../../icon-library/icon-library';
import { Loader } from '../../loader/loader';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, IconLibrary, Loader],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  private readonly authService = inject(AuthService);

  protected closeModal = output<void>();
  protected closeModalSignUp = output<void>();
  protected passwordVisible = signal(false);

  protected isLoading = signal(false);
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

  //submit
  protected async onSubmit() {
    const v = this.logInForm.value;

    this.isLoading.set(true);
    this.generalError.set(null);

    try {
      const res = await this.authService.logIn({
        email: v.email!,
        password: v.password!,
      });
      this.authService.setSession(res.data.user, res.data.token);
      this.onClose('close');
    } catch (err: any) {
      if (err.status === 401) {
        this.generalError.set(err.error.message);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
