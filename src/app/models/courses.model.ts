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

export interface CourseSingle {
  id: number;
  title: string;
  description: string;
  image: string;
  basePrice: number;
  durationWeeks: number;
  isFeatured: boolean;

  reviews: { userId: number; rating: number }[];
  isRated: boolean;

  category: Category;
  topic: Topic;
  instructor: Instructor;

  enrollment?: EnrolledCourse;
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
  weeklySchedule: WeeklySchedule;
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
export interface CoursesMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}
export interface CoursesResponse {
  data: Course[];
  meta: CoursesMeta;
}
export interface Category {
  id: number;
  name: string;
  icon: string;
}
export interface Topic {
  id: number;
  name: string;
  categoryId: number;
}
export interface Instructor {
  id: number;
  name: string;
  avatar: string;
}
export interface SortOption {
  key: string;
  label: string;
}
export const COURSES_SORT_OPTIONS: SortOption[] = [
  { key: 'newest', label: `Newest First` },
  { key: 'price_asc', label: `Price: Low to High` },
  { key: 'price_desc', label: `Price: High to Low` },
  { key: 'popular', label: `Most Popular` },
  { key: 'title_asc', label: `Title: A-Z` },
];
export interface WeeklySchedule {
  id: number;
  label: string;
  days: string[];
}
