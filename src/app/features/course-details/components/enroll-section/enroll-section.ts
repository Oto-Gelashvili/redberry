import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { IconLibrary } from '../../../../shared/components/icon-library/icon-library';
import { EnrollService } from '../../../../core/services/enroll.service';
import { SessionType, TimeSlot, WeeklySchedule } from '../../../../models/courses.model';
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
  protected isSessionTypeLoading = signal(false);
  readonly courseId = input.required<number>();
  protected avaliableWeeks = signal<WeeklySchedule[] | undefined>(undefined);
  protected avaliableTimeSlots = signal<TimeSlot[] | undefined>(undefined);
  protected avaliableSessionTypes = signal<SessionType[] | undefined>(undefined);
  protected selectedScheduleId = signal<number | null>(null);
  protected selectedTimeSlotId = signal<number | null>(null);
  protected selectedSessionTypeId = signal<number | null>(null);
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
  protected readonly allSessionTypes = [
    { id: 1, label: 'Online', icon: 'Online', price: 'Included', address: 'Google Meet' },
    { id: 2, label: 'In-Person', icon: 'InPerson', price: '+ $50', address: 'Chavchavadze St.34' },
    { id: 3, label: 'Hybrid', icon: 'Hybrid', price: '+ $30', address: 'Chavchavadze St.34' },
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
  toggleSessionType() {
    this.isSessionOpen.update((v) => !v);
  }
  isScheduleAvailable(id: number): boolean {
    return this.avaliableWeeks()?.some((w) => w.id === id) ?? false;
  }
  isTimeSlotAvaliable(id: number): boolean {
    return this.avaliableTimeSlots()?.some((w) => w.id === id) ?? false;
  }
  isSessionTypeAvaliable(id: number): boolean {
    return this.avaliableSessionTypes()?.some((w) => w.id === id) ?? false;
  }

  async selectSchedule(id: number) {
    this.selectedScheduleId.set(id);
    this.selectedTimeSlotId.set(null);
    this.selectedSessionTypeId.set(null);
    this.avaliableTimeSlots.set(undefined);
    this.avaliableSessionTypes.set(undefined);
    await this.getTimeSlot(this.courseId(), id);
  }
  async selectTimeSlot(id: number) {
    this.selectedTimeSlotId.set(id);
    this.selectedSessionTypeId.set(null);
    this.avaliableSessionTypes.set(undefined);
    await this.getSessionType(this.courseId(), this.selectedScheduleId()!, id);
  }
  async selectSessionType(id: number) {
    this.selectedSessionTypeId.set(id);
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
  async getSessionType(courseId: number, weeklyScheduleId: number, timeSlotId: number) {
    try {
      this.isSessionTypeLoading.set(true);
      const res = await this.enrollService.getSessionType(courseId, weeklyScheduleId, timeSlotId);
      this.avaliableSessionTypes.set(res);
      if (!this.isSessionOpen()) this.isSessionOpen.set(true);
      if (res.length === 1) {
        await this.selectSessionType(res[0].id);
      }
    } catch (error: any) {
      if (error.status === 422) {
        const messages = Object.values(error.error.errors).flat().join(', ');
        this.notyService.showError(messages);
      } else {
        this.notyService.showError('Failed to load session types');
      }
    } finally {
      this.isSessionTypeLoading.set(false);
    }
  }

  protected getTimeSlotTime(id: number): string {
    const apiSlot = this.avaliableTimeSlots()?.find((s) => s.id === id);
    if (apiSlot) {
      return `${this.formatTime(apiSlot.startTime)} - ${this.formatTime(apiSlot.endTime)}`;
    }
    return this.timeSlots.find((s) => s.id === id)!.time;
  }
  protected getSessionTypeData(id: number): SessionType | null {
    const apiSessionType = this.avaliableSessionTypes()?.find((s) => s.id === id);
    if (apiSessionType) {
      return apiSessionType;
    }
    return null;
  }

  private formatTime(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    const minute = minuteStr;
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${period}`;
  }
  protected formatPriceModifier(price: number | string): string {
    if (parseFloat(price as string) === 0) return 'Included';
    return `+ $${Math.round(Number(price))}`;
  }
}
