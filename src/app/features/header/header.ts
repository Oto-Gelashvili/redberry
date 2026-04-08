import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { AuthService } from '../../core/services/auth.service';
import { LogIn } from '../auth/log-in/log-in';
import { SignUp } from '../auth/sign-up/sign-up';
import { Profile } from '../profile/profile';
import { NotificationService } from '../../core/services/notification.service';
import { HostListener } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';

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
  protected readonly notyService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);

  protected toggleModal() {
    this.isLogInModalRendered.set(false);
    this.isProfileModalRendered.set(false);
    this.isModalRendered.update((v) => !v);
  }
  protected toggleLogInModal() {
    this.isModalRendered.set(false);
    this.isProfileModalRendered.set(false);
    this.isLogInModalRendered.update((v) => !v);
  }

  @HostListener('document:keydown.escape') async onEscape() {
    if (this.modalService.isProfileOpen()) {
      await this.modalService.closeProfile();
    } else {
      this.modalService.closeAll();
    }
  }
}
