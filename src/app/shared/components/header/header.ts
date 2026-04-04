import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SignUp } from '../auth/sign-up/sign-up';
import { IconLibrary } from '../icon-library/icon-library';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SignUp, IconLibrary],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected isModalRendered = signal(false);
  protected readonly authService = inject(AuthService);
  toggleModal() {
    this.isModalRendered.update((v) => !v);
  }
}
