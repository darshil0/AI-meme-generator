import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextLayer } from '../../models/meme.model';

@Component({
  selector: 'app-layer-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <fieldset class="border border-gray-200 dark:border-white/10 p-6 rounded-3xl glass-panel">
      <legend class="text-xl font-extrabold px-3 text-purple-600 dark:text-purple-300">3. Text Layers</legend>
      <div class="flex flex-col gap-6 pt-2">
        <button (click)="addLayer.emit()" type="button" class="btn-primary w-full">Add Text Layer</button>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
          @for (layer of layers; track layer.id; let i = $index) {
            <div class="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-white/10" [class.bg-purple-600/30]="selectedIndex === i">
              <button type="button" class="flex-grow truncate text-left" (click)="selectLayer.emit(i)" [attr.aria-pressed]="selectedIndex === i">
                {{ layer.text || 'Empty Layer' }}
              </button>
              <button type="button" (click)="moveLayer.emit({ index: i, direction: 'up', event: $event }); $event.stopPropagation()" [disabled]="i === 0" aria-label="Move layer up">↑</button>
              <button type="button" (click)="moveLayer.emit({ index: i, direction: 'down', event: $event }); $event.stopPropagation()" [disabled]="i === layers.length - 1" aria-label="Move layer down">↓</button>
              <button type="button" (click)="deleteLayer.emit({ index: i, event: $event }); $event.stopPropagation()" [attr.aria-label]="'Delete layer ' + (layer.text || i + 1)">×</button>
            </div>
          }
        </div>
      </div>
    </fieldset>

    @if (selectedLayer; as layer) {
      <fieldset class="border border-gray-200 dark:border-white/10 p-6 rounded-3xl glass-panel mt-4">
        <legend class="text-xl font-extrabold px-3">Style: {{ layer.text || '...' }}</legend>
        <div class="pt-2 space-y-6">
          <label class="block">Layer Text
            <input type="text" [ngModel]="layer.text" (ngModelChange)="updateProperty.emit({ property: 'text', value: $event })" class="w-full form-glass" />
          </label>
          <label class="block">Font Size: {{ layer.fontSize }}px
            <input type="range" [ngModel]="layer.fontSize" (ngModelChange)="updateProperty.emit({ property: 'fontSize', value: +$event })" min="10" max="200" />
          </label>
          <div class="grid grid-cols-2 gap-6">
            <label class="block">Fill
              <input type="color" [ngModel]="layer.fontColor" (ngModelChange)="updateProperty.emit({ property: 'fontColor', value: $event })" />
            </label>
            <label class="block">Outline
              <input type="color" [ngModel]="layer.outlineColor" (ngModelChange)="updateProperty.emit({ property: 'outlineColor', value: $event })" />
            </label>
          </div>
          <label class="block">Glow/Blur: {{ layer.textBlur }}px
            <input type="range" [ngModel]="layer.textBlur" (ngModelChange)="updateProperty.emit({ property: 'textBlur', value: +$event })" min="0" max="10" step="0.5" />
          </label>
          <label class="block">Vertical: {{ layer.top }}%
            <input type="range" [ngModel]="layer.top" (ngModelChange)="updateProperty.emit({ property: 'top', value: +$event })" min="0" max="100" />
          </label>
          <label class="block">Alignment
            <select [ngModel]="layer.textAlign ?? 'center'" (ngModelChange)="updateProperty.emit({ property: 'textAlign', value: $event })">
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </label>
          <label class="block">Rotation: {{ layer.rotation ?? 0 }}°
            <input type="range" [ngModel]="layer.rotation ?? 0" (ngModelChange)="updateProperty.emit({ property: 'rotation', value: +$event })" min="-180" max="180" />
          </label>
          <label class="block">Maximum width (px)
            <input type="number" [ngModel]="layer.maxWidth ?? ''" (ngModelChange)="updateProperty.emit({ property: 'maxWidth', value: $event === '' ? 0 : +$event })" min="0" />
          </label>
          <label class="block">Font weight
            <select [ngModel]="layer.fontWeight ?? 'normal'" (ngModelChange)="updateProperty.emit({ property: 'fontWeight', value: $event })">
              <option value="normal">Normal</option><option value="bold">Bold</option><option value="bolder">Bolder</option>
            </select>
          </label>
        </div>
      </fieldset>
    }
  `,
})
export class LayerControlsComponent {
  @Input() layers: TextLayer[] = [];
  // Alias matches the parent template's existing binding.
  @Input('selectedLayerIndex') selectedIndex: number | null = null;

  private explicitSelectedLayer: TextLayer | null = null;
  @Input()
  set selectedLayer(value: TextLayer | null) {
    this.explicitSelectedLayer = value;
  }
  get selectedLayer(): TextLayer | null {
    if (this.explicitSelectedLayer) return this.explicitSelectedLayer;
    return this.selectedIndex !== null ? this.layers[this.selectedIndex] ?? null : null;
  }

  @Output() addLayer = new EventEmitter<void>();
  @Output() selectLayer = new EventEmitter<number>();
  @Output() moveLayer = new EventEmitter<{ index: number; direction: 'up' | 'down'; event: MouseEvent }>();
  @Output() deleteLayer = new EventEmitter<{ index: number; event: MouseEvent }>();
  @Output() updateProperty = new EventEmitter<{ property: keyof TextLayer; value: string | number }>();
}
