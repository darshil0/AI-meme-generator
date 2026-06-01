import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaptionTone } from '../../models/meme.model';

@Component({
  selector: 'app-ai-captions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <fieldset class="border border-white/10 p-6 rounded-3xl glass-panel">
      <legend
        class="text-xl font-extrabold px-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
      >
        2. AI Captions
      </legend>
      <div class="flex flex-col gap-6 pt-2">
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
            Select a Tone
          </h3>
          <div class="flex flex-wrap gap-2">
            @for (tone of tones; track tone) {
              <button
                (click)="onToneSelect(tone)"
                type="button"
                [attr.aria-pressed]="selectedTone === tone"
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 capitalize border border-white/10"
                [class.bg-purple-600]="selectedTone === tone"
                [class.text-white]="selectedTone === tone"
                [class.bg-white/5]="selectedTone !== tone"
                [class.text-gray-300]="selectedTone !== tone"
                [class.hover:bg-white/10]="selectedTone !== tone"
              >
                {{ tone }}
              </button>
            }
          </div>
        </div>
        <!-- Context and Generate Section -->
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label for="userContext" class="text-sm font-medium text-white/70"
                >Context (Optional)</label
              >
              @if (userContext) {
                <button
                  (click)="onClearContext()"
                  class="text-xs text-secondary-300 hover:text-secondary-100 transition-colors"
                  title="Clear context"
                >
                  Clear
                </button>
              }
            </div>
            <textarea
              id="userContext"
              [ngModel]="userContext"
              (ngModelChange)="onContextChange($event)"
              rows="2"
              class="form-glass w-full rounded-lg p-3 text-sm text-white placeholder-white/30 resize-y"
              placeholder="e.g., programming struggle, Monday morning, cats..."
            ></textarea>
          </div>

          <button
            (click)="onGenerate()"
            [disabled]="isLoading || !isApiKeyConfigured"
            class="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold shadow-lg transition-all"
            [class.animate-pulse]="isLoading"
          >
            @if (isLoading) {
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              ></span>
              Thinking...
            } @else {
              <span class="text-lg">✨</span> Magic Captions
            }
          </button>
        </div>
        <div aria-live="polite">
          @if (error) {
            <div
              class="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl backdrop-blur-md"
              role="alert"
            >
              <strong class="font-bold">Error:</strong>
              <span class="block sm:inline ml-2">{{ error }}</span>
            </div>
          }
        </div>
        @if (captions.length > 0) {
          <div class="space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-400">Suggestions:</h3>
            @for (caption of captions; track caption) {
              <button
                (click)="applyCaption.emit(caption)"
                type="button"
                class="w-full text-left bg-white/5 p-3 rounded-xl hover:bg-white/10 border border-white/5 transition-all duration-300 text-sm italic text-gray-200"
              >
                "{{ caption }}"
              </button>
            }
          </div>
        }
      </div>
    </fieldset>
  `,
  styles: [],
})
export class AiCaptionsComponent {
  @Input() tones: CaptionTone[] = [];
  @Input() selectedTone: CaptionTone | null = null;
  @Input() userContext: string = '';
  @Input() isLoading: boolean = false;
  @Input() isApiKeyConfigured: boolean = true;
  @Input() error: string | null = null;
  @Input() captions: string[] = [];

  @Output() selectTone = new EventEmitter<CaptionTone>();
  @Output() userContextChange = new EventEmitter<string>();
  @Output() generateCaptions = new EventEmitter<void>();
  @Output() applyCaption = new EventEmitter<string>();

  onToneSelect(tone: CaptionTone) {
    this.selectTone.emit(tone);
  }

  onContextChange(value: string) {
    this.userContextChange.emit(value);
  }

  onClearContext() {
    this.userContextChange.emit('');
  }

  onGenerate() {
    this.generateCaptions.emit();
  }
}
