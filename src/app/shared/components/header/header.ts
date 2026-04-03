import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SignUp } from '../auth/sign-up/sign-up';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SignUp],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected isModalRendered = signal(false);

  toggleModal() {
    this.isModalRendered.update((v) => !v);
  }
}
