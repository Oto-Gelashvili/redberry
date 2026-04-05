import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { AuthService } from '../../core/services/auth.service';
import { LogIn } from '../auth/log-in/log-in';
import { SignUp } from '../auth/sign-up/sign-up';
import { Profile } from '../profile/profile';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SignUp, IconLibrary, LogIn, Profile],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected isModalRendered = signal(false);
  protected isLogInModalRendered = signal(false);
  protected isProfileModalRendered = signal(false);
  protected readonly authService = inject(AuthService);
  toggleModal() {
    this.isLogInModalRendered.set(false);
    this.isProfileModalRendered.set(false);
    this.isModalRendered.update((v) => !v);
  }
  toggleLogInModal() {
    this.isModalRendered.set(false);
    this.isProfileModalRendered.set(false);
    this.isLogInModalRendered.update((v) => !v);
  }
  toggleProfileModal() {
    this.isLogInModalRendered.set(false);
    this.isModalRendered.set(false);
    this.isProfileModalRendered.update((v) => !v);
  }
}
