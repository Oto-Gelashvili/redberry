import { Injectable } from '@angular/core';
import { Course } from '../../models/courses.model';

const BASE_URL = 'https://api.redclass.redberryinternship.ge/api';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  async getFeaturedCourses(): Promise<Course[]> {
    const res = await fetch(`${BASE_URL}/courses/featured`);
    const json = await res.json();
    return json.data as Course[];
  }
}
