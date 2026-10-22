import { inject, Injectable } from '@angular/core';
import { SessionType, TimeSlot, WeeklySchedule } from '../../models/courses.model';
import { AuthService } from './auth.service';
import { supabase } from './supabase'; // adjust the path

function uniqueById<T extends { id: number }>(items: T[]): T[] {
  return [...new Map(items.map((i) => [i.id, i])).values()].sort((a, b) => a.id - b.id);
}

@Injectable({ providedIn: 'root' })
export class EnrollService {
  private readonly authService = inject(AuthService);

  async getWeeklySchedule(courseId: number): Promise<WeeklySchedule[]> {
    const { data, error } = await supabase
      .from('course_schedules')
      .select('weekly_schedule:weekly_schedules(id, label, days)')
      .eq('course_id', courseId);
    if (error) throw { status: 400, error };
    return uniqueById((data as any[]).map((r) => r.weekly_schedule as WeeklySchedule));
  }

  async getTimeSlot(courseId: number, weeklyScheduleId: number): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('course_schedules')
      .select('time_slot:time_slots(id, label, start_time, end_time)')
      .eq('course_id', courseId)
      .eq('weekly_schedule_id', weeklyScheduleId);
    if (error) throw { status: 400, error };

    return uniqueById(
      (data as any[]).map((r) => ({
        id: r.time_slot.id,
        label: r.time_slot.label,
        startTime: r.time_slot.start_time,
        endTime: r.time_slot.end_time,
      })),
    );
  }

  async getSessionType(
    courseId: number,
    weeklyScheduleId: number,
    timeSlotId: number,
  ): Promise<SessionType[]> {
    const { data, error } = await supabase
      .from('course_schedules')
      .select('id, price_modifier, available_seats, location, session_type:session_types(id, name)')
      .eq('course_id', courseId)
      .eq('weekly_schedule_id', weeklyScheduleId)
      .eq('time_slot_id', timeSlotId);
    if (error) throw { status: 400, error };

    return (data as any[])
      .map((r) => ({
        id: r.session_type.id, // session type id, matches the ids in your component
        courseScheduleId: r.id,
        name: r.session_type.name,
        priceModifier: r.price_modifier,
        availableSeats: r.available_seats,
        location: r.location,
      }))
      .sort((a, b) => a.id - b.id);
  }

  async enroll(courseId: number, courseScheduleId: number, force: boolean = false): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      throw { status: 401, error: { message: 'Unauthenticated' } };
    }

    const { data, error } = await supabase.rpc('enroll_in_course', {
      p_course_id: courseId,
      p_course_schedule_id: courseScheduleId,
      p_force: force,
    });
    if (error) throw { status: 500, error };

    const r = data as any;
    if (r.ok) return;

    // same status codes your component already handles
    switch (r.code) {
      case 'unauthenticated':
        throw { status: 401, error: r };
      case 'profile_incomplete':
        throw { status: 422, error: r };
      case 'conflict':
        throw { status: 409, error: { conflicts: r.conflicts } };
      case 'no_seats':
        throw { status: 400, error: { message: 'No seats available' } };
      case 'already_enrolled':
        throw { status: 400, error: { message: 'Already enrolled' } };
      default:
        throw { status: 400, error: r };
    }
  }

  async completeCourse(enrollmentId: number): Promise<void> {
    const { data, error } = await supabase.rpc('complete_enrollment', {
      p_enrollment_id: enrollmentId,
    });
    if (error) throw { status: 500, error };
    if (!data) throw { status: 404, error: { message: 'Enrollment not found' } };
  }

  async retakeCourse(enrollmentId: number): Promise<void> {
    const { data, error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)
      .select('id');
    if (error) throw { status: 500, error };
    if (!data?.length) throw { status: 404, error: { message: 'Enrollment not found' } };
  }

  async submitReview(courseId: number, rating: number): Promise<void> {
    const { error } = await supabase.from('reviews').insert({ course_id: courseId, rating });
    if (error) {
      throw { status: error.code === '23505' ? 409 : 403, error };
    }
  }
}
