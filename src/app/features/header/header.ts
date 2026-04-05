import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { AuthService } from '../../core/services/auth.service';
import { LogIn } from '../auth/log-in/log-in';
import { SignUp } from '../auth/sign-up/sign-up';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SignUp, IconLibrary, LogIn],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected isModalRendered = signal(false);
  protected isLogInModalRendered = signal(false);
  protected readonly authService = inject(AuthService);
  toggleModal() {
    this.isLogInModalRendered.set(false);
    this.isModalRendered.update((v) => !v);
  }
  toggleLogInModal() {
    this.isModalRendered.set(false);
    this.isLogInModalRendered.update((v) => !v);
  }
}
