import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextLayer } from '../../models/meme.model';

@Component({
  selector: 'app-layer-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <fieldset class="border border-white/10 p-6 rounded-3xl glass-panel">
      <legend
        class="text-xl font-extrabold px-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400"
      >
        3. Text Layers
      </legend>
      <div class="flex flex-col gap-6 pt-2">
        <button
          (click)="addLayer.emit()"
          type="button"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Text Layer
        </button>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
          @for (layer of layers; track layer.id; let i = $index) {
            <div
              (click)="selectLayer.emit(i)"
              class="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-white/5 hover:bg-white/10"
              [class.bg-purple-600/30]="selectedIndex === i"
              [class.border-purple-500/50]="selectedIndex === i"
              [class.bg-white/5]="selectedIndex !== i"
              role="button"
              tabindex="0"
              [attr.aria-selected]="selectedIndex === i"
              [attr.aria-label]="'Select layer: ' + (layer.text || 'Empty')"
            >
              <span class="flex-grow truncate text-white font-bold">{{
                layer.text || 'Empty Layer'
              }}</span>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  (click)="
                    moveLayer.emit({ index: i, direction: 'up', event: $event });
                    $event.stopPropagation()
                  "
                  [disabled]="i === 0"
                  class="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 transition-colors"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  (click)="
                    moveLayer.emit({ index: i, direction: 'down', event: $event });
                    $event.stopPropagation()
                  "
                  [disabled]="i === layers.length - 1"
                  class="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 transition-colors"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  (click)="deleteLayer.emit({ index: i, event: $event }); $event.stopPropagation()"
                  class="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </fieldset>

    @if (selectedLayer) {
      <fieldset class="border border-white/10 p-6 rounded-3xl glass-panel mt-4">
        <legend
          class="text-xl font-extrabold px-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 max-w-full truncate"
        >
          Style: <span class="text-white">{{ selectedLayer.text || '...' }}</span>
        </legend>
        <div class="pt-2 space-y-6">
          <div>
            <label
              for="layer-text"
              class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block"
              >Layer Text</label
            >
            <input
              id="layer-text"
              type="text"
              [ngModel]="selectedLayer.text"
              (ngModelChange)="updateProperty.emit({ property: 'text', value: $event })"
              placeholder="Enter text..."
              class="w-full form-glass focus:ring-2 focus:ring-purple-500/50 outline-none"
            />
          </div>

          <div>
            <label
              for="font-size"
              class="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block"
            >
              Font Size <span>{{ selectedLayer.fontSize }}px</span>
            </label>
            <input
              id="font-size"
              type="range"
              [ngModel]="selectedLayer.fontSize"
              (ngModelChange)="updateProperty.emit({ property: 'fontSize', value: +$event })"
              min="10"
              max="200"
            />
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label
                for="font-color"
                class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block"
                >Fill</label
              >
              <input
                id="font-color"
                type="color"
                [ngModel]="selectedLayer.fontColor"
                (ngModelChange)="updateProperty.emit({ property: 'fontColor', value: $event })"
              />
            </div>
            <div>
              <label
                for="outline-color"
                class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block"
                >Outline</label
              >
              <input
                id="outline-color"
                type="color"
                [ngModel]="selectedLayer.outlineColor"
                (ngModelChange)="updateProperty.emit({ property: 'outlineColor', value: $event })"
              />
            </div>
          </div>

          <div>
            <label
              for="text-blur"
              class="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block"
            >
              Glow/Blur <span>{{ selectedLayer.textBlur }}px</span>
            </label>
            <input
              id="text-blur"
              type="range"
              [ngModel]="selectedLayer.textBlur"
              (ngModelChange)="updateProperty.emit({ property: 'textBlur', value: +$event })"
              min="0"
              max="10"
              step="0.5"
            />
          </div>

          <div>
            <label
              for="layer-top"
              class="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block"
            >
              Vertical <span>{{ selectedLayer.top }}%</span>
            </label>
            <input
              id="layer-top"
              type="range"
              [ngModel]="selectedLayer.top"
              (ngModelChange)="updateProperty.emit({ property: 'top', value: +$event })"
              min="0"
              max="100"
            />
          </div>
        </div>
      </fieldset>
    }
  `,
  styles: [],
})
export class LayerControlsComponent {
  @Input() layers: TextLayer[] = [];
  @Input() selectedIndex: number | null = null;
  @Input() selectedLayer: TextLayer | null = null;

  @Output() addLayer = new EventEmitter<void>();
  @Output() selectLayer = new EventEmitter<number>();
  @Output() moveLayer = new EventEmitter<{
    index: number;
    direction: 'up' | 'down';
    event: MouseEvent;
  }>();
  @Output() deleteLayer = new EventEmitter<{ index: number; event: MouseEvent }>();
  @Output() updateProperty = new EventEmitter<{ property: string; value: any }>();
}
