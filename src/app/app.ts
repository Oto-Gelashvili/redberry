import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './features/header/header';
import { NotificationModal } from './shared/components/notification-modal/notification-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, NotificationModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('redberry');
}
