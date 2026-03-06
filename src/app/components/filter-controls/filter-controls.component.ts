import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageFilter } from '../../models/meme.model';

@Component({
    selector: 'app-filter-controls',
    standalone: true,
    imports: [CommonModule],
    template: `
    <fieldset class="border border-white/10 p-4 rounded-2xl glass-panel">
      <legend class="text-xl font-bold px-2 text-purple-300">Image Filters</legend>
      <div class="flex flex-wrap gap-2 pt-2">
        @for (filter of filters; track filter) {
          <button
            (click)="applyFilter.emit(filter)"
            type="button"
            [attr.aria-pressed]="selectedFilter === filter"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 capitalize border border-white/10"
            [class.bg-purple-600]="selectedFilter === filter"
            [class.text-white]="selectedFilter === filter"
            [class.bg-white/5]="selectedFilter !== filter"
            [class.text-gray-300]="selectedFilter !== filter"
            [class.hover:bg-white/10]="selectedFilter !== filter"
            [class.glass-button]="selectedFilter === filter"
          >
            {{ filter }}
          </button>
        }
      </div>
    </fieldset>
  `,
    styles: []
})
export class FilterControlsComponent {
    @Input() filters: ImageFilter[] = [];
    @Input() selectedFilter: ImageFilter = ImageFilter.NONE;
    @Output() applyFilter = new EventEmitter<ImageFilter>();
}
