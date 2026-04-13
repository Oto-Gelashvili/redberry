import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { IconLibrary } from '../../../../shared/components/icon-library/icon-library';
import { EnrollService } from '../../../../core/services/enroll.service';
import { WeeklySchedule } from '../../../../models/courses.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { Loader } from '../../../../shared/components/loader/loader';

@Component({
  selector: 'app-enroll-section',
  imports: [ReactiveFormsModule, IconLibrary, Loader],
  templateUrl: './enroll-section.html',
  styleUrl: './enroll-section.css',
})
export class EnrollSection implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly enrollService = inject(EnrollService);
  protected readonly notyService = inject(NotificationService);
  protected isScheduleOpen = signal(true);
  protected isTimeOpen = signal(false);
  protected isSessionOpen = signal(false);
  protected isWeeksLoading = signal(false);
  readonly courseId = input.required<number>();
  protected avaliableWeeks = signal<WeeklySchedule[] | undefined>(undefined);
  protected selectedScheduleId = signal<number | null>(null);
  protected readonly allSchedules = [
    { id: 1, label: 'Mon - Wed' },
    { id: 2, label: 'Tue - Thu' },
    { id: 3, label: 'Wed - Fri' },
    { id: 4, label: 'Weekend' },
  ];

  enrollmentForm = new FormGroup({
    schedule: new FormControl('', Validators.required),
    timeSlot: new FormControl({ value: '', disabled: true }, Validators.required),
    sessionType: new FormControl({ value: '', disabled: true }, Validators.required),
  });

  ngOnInit(): void {
    this.loadWeeklySchedules(this.courseId());
  }

  async loadWeeklySchedules(id: number) {
    try {
      this.isWeeksLoading.set(true);
      const res = await this.enrollService.getWeeklySchedule(id);
      this.avaliableWeeks.set(res);
    } catch (error: any) {
      if (error.status === 404) {
        this.notyService.showError(error.message);
      } else {
        this.notyService.showError('Failed to load course');
      }
    } finally {
      this.isWeeksLoading.set(false);
    }
  }
  toggleSchedule() {
    this.isScheduleOpen.update((v) => !v);
  }
  isScheduleAvailable(id: number): boolean {
    return this.avaliableWeeks()?.some((w) => w.id === id) ?? false;
  }

  selectSchedule(id: number) {
    this.selectedScheduleId.set(id);
  }
}
