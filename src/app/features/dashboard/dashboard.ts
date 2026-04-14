import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { IconLibrary } from '../../shared/components/icon-library/icon-library';
import { CoursesService } from '../../core/services/courses.service';
import { Course, EnrolledCourse } from '../../models/courses.model';
import { NotificationService } from '../../core/services/notification.service';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  imports: [IconLibrary, RouterLink, NgOptimizedImage, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private autoPlayInterval: any;

  protected currentSlide = signal(0);
  protected isPrevDisabled = computed(() => this.currentSlide() === 0);
  protected isNextDisabled = computed(() => this.currentSlide() === 2);

  private readonly courseService = inject(CoursesService);
  protected readonly authService = inject(AuthService);
  private readonly notyService = inject(NotificationService);
  protected readonly modalService = inject(ModalService);

  protected featuredCourses = signal<Course[]>([]);
  protected progressCourses = signal<EnrolledCourse[]>([]);
  protected isLoadingCourses = signal(false);
  protected isLoadingInProgress = signal(false);
  protected progressCourseAmount = signal(0);

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadCoursesInProgress();
        this.loadProgressCourseAmount();
      } else {
        this.progressCourses.set([]);
        this.progressCourseAmount.set(0);
      }
    });
  }
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
      this.notyService.showError('Failed to load featured courses');
    } finally {
      this.isLoadingCourses.set(false);
    }
  }

  private async loadCoursesInProgress() {
    this.isLoadingInProgress.set(true);
    try {
      const courses = await this.courseService.getCoursesInProgress();
      this.progressCourses.set(courses);
    } catch (err: any) {
      this.notyService.showError('Failed to load courses in progress');
    } finally {
      this.isLoadingInProgress.set(false);
    }
  }

  private async loadProgressCourseAmount() {
    try {
      const enrollments = await this.courseService.getEnrolledCourses();
      const inProgress = enrollments.filter((course) => course.progress < 100);
      this.progressCourseAmount.set(inProgress.length);
    } catch {}
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
