import { Component, ElementRef, inject, signal } from '@angular/core';
import { IconLibrary } from '../../../../shared/components/icon-library/icon-library';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../core/services/modal.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hamburger',
  imports: [IconLibrary, RouterLink],
  templateUrl: './hamburger.html',
  styleUrl: './hamburger.css',
  host: {
    '(document:keydown.escape)': 'close()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Hamburger {
  protected readonly authService = inject(AuthService);
  protected readonly modalService = inject(ModalService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected isOpen = signal(false);
  protected toggleMenu() {
    this.isOpen.update((v) => !v);
  }
  protected close() {
    this.isOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent) {
    if (!this.isOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
