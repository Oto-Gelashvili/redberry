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
    fullName: new FormControl<string>(this.authService.user()?.fullName ?? 'Full name', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\s]+$/),
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
