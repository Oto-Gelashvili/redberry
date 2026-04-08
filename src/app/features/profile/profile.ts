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
import { ImgUploader } from '../../shared/components/img-uploader/img-uploader';
import { Dropdown } from '../../shared/components/dropdown/dropdown';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../core/services/modal.service';

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
function validAge(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) return null;
  if (isNaN(value)) return { ageNotNumber: true };
  if (value < 16) return { ageTooYoung: true };
  if (value > 120) return { ageInvalid: true };

  return null;
}
@Component({
  selector: 'app-profile',
  imports: [IconLibrary, Loader, ReactiveFormsModule, ImgUploader, Dropdown],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  protected readonly authService = inject(AuthService);
  protected readonly notyService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);

  protected selectedFile = signal<File | null>(null);
  protected isDropdownShown = signal(false);
  protected isClosing = signal(false);
  protected serverErrors = signal<Record<string, string[]>>({});
  protected generalError = signal<string | null>(null);
  protected isLoading = signal(false);
  protected options = Array.from({ length: 120 - 16 + 1 }, (_, i) => i + 16);
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
    age: new FormControl<number | null>(this.authService.user()?.age ?? null, [
      Validators.required,
      validAge,
    ]),
    avatar: new FormControl(''),
  });

  //avatar
  protected onFileSelected(file: File) {
    this.selectedFile.set(file);
    const control = this.profileForm.get('avatar');
    control?.setErrors(null);
    control?.setValue(file.name);
  }

  protected onFileError(error: 'incorrectFormat' | 'tooLarge') {
    const control = this.profileForm.get('avatar');
    control?.setErrors({ [error]: true });
  }

  // apllying error class to errorcont items
  protected applyMobileErrorCont() {
    if (this.profileForm.get('mobile')?.touched) {
      return this.profileForm.get('mobile')?.invalid;
    }
    return false;
  }
  protected applyAgeErrorCont() {
    if (this.profileForm.get('age')?.touched) {
      return this.profileForm.get('age')?.invalid;
    }
    return false;
  }

  //age dropdown
  protected closeDropdown() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isDropdownShown.set(false);
      this.isClosing.set(false);
    }, 600);
  }

  protected toggleDropdown() {
    if (this.isDropdownShown()) {
      this.closeDropdown();
    } else {
      this.isDropdownShown.set(true);
    }
  }

  protected onOptionChanged(option: number) {
    this.profileForm.patchValue({ age: option });
    this.closeDropdown();
  }

  //btn disabled
  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;
    if (!this.profileForm.dirty && !this.selectedFile()) return true;
    return this.profileForm.invalid;
  }

  protected clearServerError(field: string) {
    if (this.serverErrors()[field]) {
      this.serverErrors.update((errors) => {
        const updated = { ...errors };
        delete updated[field];
        return updated;
      });
    }
  }
  protected async onSubmit() {
    const v = this.profileForm.value;
    const formData = new FormData();
    formData.append('full_name', v.fullName!);
    formData.append('mobile_number', v.mobile!);
    formData.append('age', String(v.age!));
    if (this.selectedFile()) {
      formData.append('avatar', this.selectedFile()!);
    }

    this.isLoading.set(true);
    this.serverErrors.set({});
    this.generalError.set(null);

    try {
      const res = await this.authService.updateProfile(formData);
      this.authService.updateUser(res.data);
      this.notyService.showSuccess('Profile updated successfully');
      this.modalService.closeAll();
    } catch (err: any) {
      if (err.status === 401) {
        this.generalError.set('Session expired. Please log in again.');
        this.authService.logout();
      } else if (err.status === 422) {
        const errors = err.error.errors ?? {};
        this.serverErrors.set(errors);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
