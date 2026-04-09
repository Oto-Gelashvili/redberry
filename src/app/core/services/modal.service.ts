import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly authService = inject(AuthService);
  private readonly notyService = inject(NotificationService);

  isSignUpOpen = signal(false);
  isLogInOpen = signal(false);
  isProfileOpen = signal(false);
  isPanelRendered = signal(false);

  openSignUp() {
    this.isLogInOpen.set(false);
    this.isProfileOpen.set(false);
    this.isSignUpOpen.set(true);
  }

  openLogIn() {
    this.isSignUpOpen.set(false);
    this.isProfileOpen.set(false);
    this.isLogInOpen.set(true);
  }

  openProfile() {
    this.isSignUpOpen.set(false);
    this.isLogInOpen.set(false);
    this.isProfileOpen.set(true);
  }
  openSidePanel() {
    this.isPanelRendered.set(true);
  }
  closeSidePanel() {
    this.isPanelRendered.set(false);
  }

  async closeProfile() {
    if (!this.authService.user()?.profileComplete) {
      const confirmed = await this.notyService.confirm(
        "Your profile is incomplete. You won't be able to enroll in courses until you complete it. Close anyway?",
      );
      if (!confirmed) return;
    }
    this.isProfileOpen.set(false);
  }

  closeAll() {
    this.isSignUpOpen.set(false);
    this.isLogInOpen.set(false);
    this.isProfileOpen.set(false);
  }
}
