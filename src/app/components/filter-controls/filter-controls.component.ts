import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageFilter } from '../../models/meme.model';

@Component({
  selector: 'app-filter-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <fieldset class="border border-gray-200 dark:border-white/10 p-4 rounded-2xl glass-panel">
      <legend class="text-xl font-bold px-2 text-purple-600 dark:text-purple-300">Image Filters</legend>
      <div class="flex flex-wrap gap-2 pt-2">
        @for (filter of filters; track filter) {
          <button type="button" (click)="selectFilter.emit(filter)" [attr.aria-pressed]="selectedFilter === filter"
            class="px-4 py-2 rounded-xl text-sm font-semibold capitalize border border-gray-200 dark:border-white/10"
            [class.bg-purple-600]="selectedFilter === filter" [class.text-white]="selectedFilter === filter">
            {{ filter }}
          </button>
        }
      </div>
    </fieldset>
  `,
})
export class FilterControlsComponent {
  // Keep the options populated even if a caller only binds the selected filter.
  @Input() filters: ImageFilter[] = Object.values(ImageFilter);
  @Input('currentFilter') selectedFilter: ImageFilter = ImageFilter.NONE;
  @Output('selectFilter') applyFilter = new EventEmitter<ImageFilter>();
}
