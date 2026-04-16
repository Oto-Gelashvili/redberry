import { Component, input, model, signal } from '@angular/core';
import { IconLibrary } from '../icon-library/icon-library';

@Component({
  selector: 'app-rater',
  imports: [IconLibrary],
  templateUrl: './rater.html',
  styleUrl: './rater.css',
})
export class Rater {
  readonly rating = model<number>(0);
  protected hoveredStar = signal(0);
  readonly size = input.required<number>();
}
