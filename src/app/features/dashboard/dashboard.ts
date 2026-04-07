import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { CoursesService } from '../../core/services/courses.service';
import { Course } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [IconLibrary, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private autoPlayInterval: any;

  protected currentSlide = signal(0);
  protected isPrevDisabled = computed(() => this.currentSlide() === 0);
  protected isNextDisabled = computed(() => this.currentSlide() === 2);

  private readonly courseService = inject(CoursesService);
  private readonly notyService = inject(NotificationService);
  protected featuredCourses = signal<Course[]>([]);
  protected isLoadingCourses = signal(false);

  ngOnInit() {
    this.startAutoPlay();
    this.loadFeaturedCourses();
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

  private async loadFeaturedCourses() {
    this.isLoadingCourses.set(true);
    try {
      const courses = await this.courseService.getFeaturedCourses();
      this.featuredCourses.set(courses);
    } catch {
      this.notyService.showError('Failed to load courses');
    } finally {
      this.isLoadingCourses.set(false);
    }
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
