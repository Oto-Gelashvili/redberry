import { inject, Injectable } from '@angular/core';
import { EnrolledCourse, SessionType, TimeSlot, WeeklySchedule } from '../../models/courses.model';
import { AuthService } from './auth.service';

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api';

@Injectable({ providedIn: 'root' })
export class EnrollService {
  private readonly authService = inject(AuthService);
  async getWeeklySchedule(courseId: number): Promise<WeeklySchedule[]> {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/weekly-schedules`);
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as WeeklySchedule[];
  }
  async getTimeSlot(courseId: number, weeklyScheduleId: number): Promise<TimeSlot[]> {
    const res = await fetch(
      `${BASE_URL}/courses/${courseId}/time-slots?weekly_schedule_id=${weeklyScheduleId}`,
    );
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as TimeSlot[];
  }
  async getSessionType(
    courseId: number,
    weeklyScheduleId: number,
    timeSlotId: number,
  ): Promise<SessionType[]> {
    const res = await fetch(
      `${BASE_URL}/courses/${courseId}/session-types?weekly_schedule_id=${weeklyScheduleId}&time_slot_id=${timeSlotId}`,
    );
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as SessionType[];
  }

  async enroll(
    courseId: number,
    courseScheduleId: number,
    force: boolean = false,
  ): Promise<EnrolledCourse> {
    const res = await fetch(`${BASE_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authService.token()}`,
      },
      body: JSON.stringify({ courseId, courseScheduleId, force }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as EnrolledCourse;
  }
  async completeCourse(courseId: number): Promise<EnrolledCourse> {
    const res = await fetch(`${BASE_URL}/enrollments/${courseId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authService.token()}`,
      },
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as EnrolledCourse;
  }
}
