import { Component, computed, input, output } from '@angular/core';
import { Category, Instructor, Topic } from '../../../../models/courses.model';
import { IconLibrary } from '../../../../shared/components/icon-library/icon-library';

@Component({
  selector: 'app-courses-filter',
  imports: [IconLibrary],
  templateUrl: './courses-filter.html',
  styleUrl: './courses-filter.css',
})
export class CoursesFilter {
  categories = input.required<Category[]>();
  topics = input.required<Topic[]>();
  instructors = input.required<Instructor[]>();

  selectedCategories = input.required<number[]>();
  selectedTopics = input.required<number[]>();
  selectedInstructors = input.required<number[]>();

  isLoading = input<boolean>(false);

  categoryToggled = output<number>();
  topicToggled = output<number>();
  instructorToggled = output<number>();
  filtersCleared = output<void>();

  protected activeFiltersCount = computed(
    () =>
      this.selectedCategories().length +
      this.selectedTopics().length +
      this.selectedInstructors().length,
  );
}
