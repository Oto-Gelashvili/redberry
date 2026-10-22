import { Course, EnrolledCourse, Topic } from '../../models/courses.model';

export const COURSE_SELECT = `
  id, title, description, image, base_price, duration_weeks, is_featured, avg_rating, review_count,
  category:categories(id, name, icon),
  topic:topics(id, name, category_id),
  instructor:instructors(id, name, avatar)
`;

export const ENROLLMENT_SELECT = `
  id, quantity, total_price, progress, completed_at,
  course:courses(${COURSE_SELECT}),
  schedule:course_schedules(
    id, location, price_modifier, available_seats,
    weekly_schedule:weekly_schedules(id, label, days),
    time_slot:time_slots(id, label, start_time, end_time),
    session_type:session_types(id, name)
  )
`;

export function mapTopic(t: any): Topic {
  return { id: t.id, name: t.name, categoryId: t.category_id };
}

export function mapCourse(r: any): Course {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.image,
    basePrice: r.base_price,
    durationWeeks: r.duration_weeks,
    isFeatured: r.is_featured,
    avgRating: r.avg_rating,
    reviewCount: r.review_count,
    category: r.category,
    topic: mapTopic(r.topic),
    instructor: r.instructor,
  };
}

export function mapEnrollment(r: any): EnrolledCourse {
  const s = r.schedule;
  return {
    id: r.id,
    quantity: r.quantity,
    totalPrice: r.total_price,
    progress: r.progress,
    completedAt: r.completed_at ?? null,
    course: mapCourse(r.course),
    schedule: {
      weeklySchedule: s.weekly_schedule,
      timeSlot: {
        id: s.time_slot.id,
        label: s.time_slot.label,
        startTime: s.time_slot.start_time,
        endTime: s.time_slot.end_time,
      },
      sessionType: {
        id: s.session_type.id,
        courseScheduleId: s.id,
        name: s.session_type.name,
        priceModifier: s.price_modifier,
        availableSeats: s.available_seats,
        location: s.location,
      },
      location: s.location,
    },
  };
}
