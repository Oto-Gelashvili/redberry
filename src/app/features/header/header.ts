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
import { SidePanel } from '../side-panel/side-panel';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SignUp, IconLibrary, LogIn, Profile, SidePanel],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly authService = inject(AuthService);
  protected readonly notyService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);

  @HostListener('document:keydown.escape') async onEscape() {
    if (this.modalService.isPanelRendered()) {
      this.modalService.closeSidePanel();
      return;
    }
    if (this.modalService.isProfileOpen()) {
      await this.modalService.closeProfile();
    } else {
      this.modalService.closeAll();
    }
  }
}
