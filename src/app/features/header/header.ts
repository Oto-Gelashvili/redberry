import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, IconLibrary],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly authService = inject(AuthService);
  protected readonly notyService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);
}
