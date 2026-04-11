import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { SortOption } from '../../../../models/courses.model';

@Component({
  selector: 'app-sorter',
  imports: [],
  templateUrl: './sorter.html',
  styleUrl: './sorter.css',
})
export class SorterComponent {
  options = input.required<SortOption[]>();
  sortChanged = output<string>();
  initialSort = input<string>('');

  readonly isOpen = signal(false);
  readonly selectedOption = signal<SortOption | null>(null);

  constructor() {
    effect(() => {
      const options = this.options();
      const sort = this.initialSort();

      if (!options.length) return;

      const match = options.find((o) => o.key === sort);
      this.selectedOption.set(match ?? options[0]);
    });
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  select(option: SortOption): void {
    if (this.selectedOption()?.key === option.key) return;

    this.selectedOption.set(option);
    this.isOpen.set(false);
    this.sortChanged.emit(option.key);
  }
}
