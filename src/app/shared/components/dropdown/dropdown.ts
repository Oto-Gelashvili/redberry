import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
})
export class Dropdown {
  options = input.required<number[]>();
  optionChanged = output<number>();

  readonly selectedOption = signal<number | null>(null);

  select(option: number): void {
    this.selectedOption.set(option);
    this.optionChanged.emit(option);
  }
}
