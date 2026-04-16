import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard',
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/courses').then((m) => m.Courses),
    title: 'Browse Courses',
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/course-details/course-details').then((m) => m.CourseDetails),
  },
];
