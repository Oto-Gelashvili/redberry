import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { IconLibrary } from '../../../../shared/components/icon-library/icon-library';
import { EnrollService } from '../../../../core/services/enroll.service';
import { TimeSlot, WeeklySchedule } from '../../../../models/courses.model';
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
  protected isTimeSlotLoading = signal(false);
  readonly courseId = input.required<number>();
  protected avaliableWeeks = signal<WeeklySchedule[] | undefined>(undefined);
  protected avaliableTimeSlots = signal<TimeSlot[] | undefined>(undefined);
  protected selectedScheduleId = signal<number | null>(null);
  protected selectedTimeSlotId = signal<number | null>(null);
  protected readonly allSchedules = [
    { id: 1, label: 'Mon - Wed' },
    { id: 2, label: 'Tue - Thu' },
    { id: 3, label: 'Wed - Fri' },
    { id: 4, label: 'Weekend' },
  ];
  protected readonly timeSlots = [
    { id: 1, label: 'Morning', icon: 'morning', time: '9:00 AM - 11:00 AM' },
    { id: 2, label: 'Afternoon', icon: 'afternoon', time: '2:00 PM - 4:00 PM' },
    { id: 3, label: 'Evening', icon: 'evening', time: '6:00 PM - 8:00 PM' },
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
        this.notyService.showError('Failed to load Weekly Schedules');
      }
    } finally {
      this.isWeeksLoading.set(false);
    }
  }
  toggleSchedule() {
    this.isScheduleOpen.update((v) => !v);
  }
  toggleTimeSlot() {
    this.isTimeOpen.update((v) => !v);
  }
  isScheduleAvailable(id: number): boolean {
    return this.avaliableWeeks()?.some((w) => w.id === id) ?? false;
  }
  isTimeSlotAvaliable(id: number): boolean {
    return this.avaliableTimeSlots()?.some((w) => w.id === id) ?? false;
  }

  async selectSchedule(id: number) {
    this.selectedScheduleId.set(id);
    await this.getTimeSlot(this.courseId(), id);
  }
  async selectTimeSlot(id: number) {
    this.selectedTimeSlotId.set(id);
    // await this.getTimeSlot(this.courseId(), id);
  }

  async getTimeSlot(courseId: number, weeklyScheduleId: number) {
    try {
      this.isTimeSlotLoading.set(true);
      const res = await this.enrollService.getTimeSlot(courseId, weeklyScheduleId);
      this.avaliableTimeSlots.set(res);
      if (!this.isTimeOpen()) this.isTimeOpen.set(true);
      if (res.length === 1) {
        await this.selectTimeSlot(res[0].id);
      }
    } catch (error: any) {
      if (error.status === 422) {
        const messages = Object.values(error.error.errors).flat().join(', ');
        this.notyService.showError(messages);
      } else {
        this.notyService.showError('Failed to load time slots');
      }
    } finally {
      this.isTimeSlotLoading.set(false);
    }
  }
}
