import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemeTemplate } from '../../models/meme.model';

/**
 * Component displaying a searchable grid of meme templates,
 * supporting both default stock templates and custom user uploads.
 */
@Component({
  selector: 'app-template-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-white/10">
        <p class="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Select a Template
        </p>
        <div class="mb-6">
          <label for="template-search" class="sr-only">Search templates</label>
          <input
            id="template-search"
            type="text"
            placeholder="Search templates..."
            [ngModel]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            class="w-full form-glass focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>
        <div
          class="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin"
        >
          @for (template of templates; track template.url) {
            <div class="relative group aspect-square">
              <button
                (click)="selectTemplate.emit(template)"
                [attr.aria-label]="'Select template: ' + template.name"
                class="w-full h-full p-0 border border-gray-200 dark:border-white/10 bg-transparent rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                type="button"
              >
                <img
                  [src]="template.url"
                  [alt]="template.name"
                  class="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                  loading="lazy"
                />
                <div
                  class="absolute bottom-0 left-0 right-0 p-2 text-center bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <p class="text-white text-[10px] font-bold uppercase truncate">
                    {{ template.name }}
                  </p>
                </div>
              </button>
              @if (loadingUrl === template.url) {
                <div
                  class="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center pointer-events-none rounded-2xl"
                >
                  <svg
                    class="animate-spin h-8 w-8 text-purple-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              }
              @if (template.isCustom) {
                <button
                  (click)="deleteCustomTemplate.emit({ template, event: $event })"
                  [attr.aria-label]="'Delete template ' + template.name"
                  class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-black shadow-lg hover:bg-red-700 transition-colors z-10"
                  type="button"
                >
                  ×
                </button>
              }
            </div>
          } @empty {
            <div class="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 italic">
              No templates found
            </div>
          }
        </div>
        @if (hasCustomTemplates) {
          <button
            (click)="clearAllCustomTemplates.emit()"
            type="button"
            class="mt-4 text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors w-fit"
          >
            Clear all custom templates
          </button>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class TemplateGridComponent {
  /** Array of meme templates to render in grid */
  @Input() templates: MemeTemplate[] = [];
  /** URL of template currently being loaded */
  @Input() loadingUrl: string | null = null;
  /** Active search query string */
  @Input() searchQuery: string = '';
  /** Flag indicating if user has custom templates saved */
  @Input() hasCustomTemplates: boolean = false;

  /** Event emitted when a template is selected */
  @Output() selectTemplate = new EventEmitter<MemeTemplate>();
  /** Event emitted when user requests deletion of a custom template */
  @Output() deleteCustomTemplate = new EventEmitter<{
    template: MemeTemplate;
    event: MouseEvent;
  }>();
  /** Event emitted when user requests deletion of all custom templates */
  @Output() clearAllCustomTemplates = new EventEmitter<void>();
  /** Event emitted when search query text changes */
  @Output() searchQueryChange = new EventEmitter<string>();

  /**
   * Emits the updated template search query string to parent component.
   * @param value Search query input string.
   */
  onSearchChange(value: string): void {
    this.searchQueryChange.emit(value);
  }
}
