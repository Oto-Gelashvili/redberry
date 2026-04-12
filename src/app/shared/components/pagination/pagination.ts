import { Component, computed, input, output, signal } from '@angular/core';
import { IconLibrary } from '../icon-library/icon-library';

@Component({
  selector: 'app-pagination',
  imports: [IconLibrary],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  currentPage = input.required<number>();
  lastPage = input.required<number>();
  isLoading = input<boolean>(false);

  pageChange = output<number>();

  protected editingDots = signal<'left' | 'right' | null>(null);
  protected dotsInputValue = signal('');

  protected visiblePages = computed(() => {
    const current = this.currentPage();
    const last = this.lastPage();
    const pages: (number | 'dots-left' | 'dots-right')[] = [];

    if (last <= 5) {
      for (let i = 1; i <= last; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current <= 3) {
      pages.push(2, 3);
      if (current === 3) pages.push(4);
      pages.push('dots-right');
    } else if (current >= last - 2) {
      pages.push('dots-left');
      if (current === last - 2) pages.push(last - 3);
      pages.push(last - 2, last - 1);
    } else {
      pages.push('dots-left');
      pages.push(current - 1, current, current + 1);
      pages.push('dots-right');
    }
    pages.push(last);
    return pages;
  });

  protected goToPage(page: number) {
    if (page < 1 || page > this.lastPage() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }

  protected onDotsClick(side: 'left' | 'right') {
    this.editingDots.set(side);
    this.dotsInputValue.set('');
  }

  protected onDotsInputKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const page = Number(this.dotsInputValue());
      if (Number.isInteger(page)) this.goToPage(page);
      this.editingDots.set(null);
    }
    if (event.key === 'Escape') {
      this.editingDots.set(null);
    }
  }

  protected onDotsInputBlur() {
    this.editingDots.set(null);
  }
}
