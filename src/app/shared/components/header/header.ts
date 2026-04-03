import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SignUp } from '../auth/sign-up/sign-up';
import { IconLibrary } from '../icon-library/icon-library';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SignUp, IconLibrary],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected isModalRendered = signal(false);

  toggleModal() {
    this.isModalRendered.update((v) => !v);
  }
}
