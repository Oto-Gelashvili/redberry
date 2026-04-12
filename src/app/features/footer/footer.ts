import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconLibrary],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly modalService = inject(ModalService);
  protected readonly authService = inject(AuthService);
}
