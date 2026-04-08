import { inject, Injectable } from '@angular/core';
import { Course, EnrolledCourse } from '../../models/courses.model';
import { AuthService } from './auth.service';

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly authService = inject(AuthService);

  async getFeaturedCourses(): Promise<Course[]> {
    const res = await fetch(`${BASE_URL}/courses/featured`);
    const json = await res.json();
    return json.data as Course[];
  }
  async getCoursesInProgress(): Promise<EnrolledCourse[]> {
    const res = await fetch(`${BASE_URL}/courses/in-progress`, {
      headers: { Authorization: `Bearer ${this.authService.token()}` },
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as EnrolledCourse[];
  }
  async getEnrolledCourses(): Promise<EnrolledCourse[]> {
    const res = await fetch(`${BASE_URL}/enrollments`, {
      headers: { Authorization: `Bearer ${this.authService.token()}` },
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, error: json };
    }
    return json.data as EnrolledCourse[];
  }
}
