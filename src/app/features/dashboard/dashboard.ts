import { Component, computed, OnInit, signal } from '@angular/core';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';

@Component({
  selector: 'app-dashboard',
  imports: [IconLibrary],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private autoPlayInterval: any;

  protected currentSlide = signal(0);
  protected isPrevDisabled = computed(() => this.currentSlide() === 0);
  protected isNextDisabled = computed(() => this.currentSlide() === 2);

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    clearInterval(this.autoPlayInterval);
  }

  private startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      if (this.isNextDisabled()) {
        this.currentSlide.set(0);
      } else {
        this.nextSlide();
      }
    }, 3000);
  }

  protected pauseAutoPlay() {
    clearInterval(this.autoPlayInterval);
  }

  protected resumeAutoPlay() {
    this.startAutoPlay();
  }

  protected nextSlide() {
    this.currentSlide.update((v) => Math.min(v + 1, 2));
  }

  protected prevSlide() {
    this.currentSlide.update((v) => Math.max(v - 1, 0));
  }
}
