import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './features/header/header';
import { NotificationModal } from './shared/components/notification-modal/notification-modal';
import { Footer } from './features/footer/footer';
import { EnrollmentModal } from './shared/components/enrollment-modal/enrollment-modal';
import { ModalService } from './core/services/modal.service';
import { SignUp } from './features/auth/sign-up/sign-up';
import { LogIn } from './features/auth/log-in/log-in';
import { Profile } from './features/profile/profile';
import { SidePanel } from './features/side-panel/side-panel';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    NotificationModal,
    Footer,
    EnrollmentModal,
    SignUp,
    LogIn,
    Profile,
    SidePanel,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('redberry');
  protected readonly modalService = inject(ModalService);
  @HostListener('document:keydown.escape')
  async onEscape() {
    if (this.modalService.isPanelRendered()) {
      this.modalService.closeSidePanel();
      return;
    }

    if (this.modalService.enrollmentModal()) {
      this.modalService.closeEnrollmentModal();
      return;
    }

    if (this.modalService.isProfileOpen()) {
      await this.modalService.closeProfile();
      return;
    }

    this.modalService.closeAll();
  }
}
