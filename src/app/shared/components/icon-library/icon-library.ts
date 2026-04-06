import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-library',
  imports: [],
  templateUrl: './icon-library.html',
  styleUrl: './icon-library.css',
})
export class IconLibrary {
  name = input.required<string>();
  size = input.required<number>();
  circleColor = input<string>('#F4A316');
}
