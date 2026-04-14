import { Injectable } from '@angular/core';
import { TimeSlot, WeeklySchedule } from '../../models/courses.model';

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api';

@Injectable({ providedIn: 'root' })
export class EnrollService {
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
}
