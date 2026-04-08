export interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  basePrice: number;
  durationWeeks: number;
  isFeatured: boolean;
  avgRating: number;
  reviewCount: number;
  category: {
    id: number;
    name: string;
    icon: string;
  };
  topic: {
    id: number;
    name: string;
    categoryId: number;
  };
  instructor: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface EnrolledCourse {
  id: number;
  quantity: number;
  totalPrice: number;
  progress: number;
  completedAt: string;
  course: Course;
  schedule: CourseSchedule;
}
export interface CourseSchedule {
  weeklySchedule: {
    id: number;
    label: string;
    days: string[];
  };
  timeSlot: {
    id: number;
    label: string;
    startTime: string;
    endTime: string;
  };
  sessionType: {
    id: number;
    courseScheduleId: number;
    name: string;
    priceModifier: number;
    availableSeats: number;
    location: string;
  };
  location: string;
}
