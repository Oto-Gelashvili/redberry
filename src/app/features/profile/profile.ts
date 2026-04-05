import { Component, inject, output, signal } from '@angular/core';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { Loader } from '../../shared/components/loader/loader';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

function minLetters(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '').trimStart();
  return value.length >= 3 ? null : { minLetters: true };
}
function georgianMobileNumber(control: AbstractControl): ValidationErrors | null {
  const digits = (control.value ?? '').replace('+995', '').replace(/\s/g, '');

  if (digits.length === 0) return null;
  if (!/^\d+$/.test(digits)) return { mobileFormat: true };
  if (!digits.startsWith('5')) return { mobileStartsWith: true };
  if (digits.length !== 9) return { mobileLength: true };

  return null;
}
@Component({
  selector: 'app-profile',
  imports: [IconLibrary, Loader, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  protected readonly authService = inject(AuthService);
  protected closeModal = output<void>();
  protected generalError = signal<string | null>(null);
  protected isLoading = signal(false);
  protected onClose() {
    this.closeModal.emit();
  }
  protected profileForm = new FormGroup({
    fullName: new FormControl<string>(this.authService.user()?.fullName ?? '', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\s]+$/),
      minLetters,
    ]),
    mobile: new FormControl<string>(this.authService.user()?.mobileNumber ?? '', [
      Validators.required,
      georgianMobileNumber,
    ]),
  });

  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;

    const form = this.profileForm;

    return form.invalid;
  }

  onSubmit() {
    console.log('submit');
  }
}
