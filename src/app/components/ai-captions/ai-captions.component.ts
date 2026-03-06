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
      <legend class="text-xl font-extrabold px-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        2. AI Captions
      </legend>
      <div class="flex flex-col gap-6 pt-2">
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Select a Tone</h3>
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
        <div>
          <label for="user-context" class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 block">
            Add context (optional)
          </label>
          <textarea
            id="user-context"
            [ngModel]="userContext"
            (ngModelChange)="userContextChange.emit($event)"
            placeholder="e.g., 'My cat hates Mondays'"
            class="w-full form-glass focus:ring-2 focus:ring-purple-500/50 outline-none"
            rows="2"
          ></textarea>
        </div>
        <button
          (click)="onGenerate()"
          type="button"
          [disabled]="isLoading || !isApiKeyConfigured"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
        >
          @if (isLoading) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          }
          Magic Captions
        </button>
        <div aria-live="polite">
          @if (error) {
            <div class="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl backdrop-blur-md" role="alert">
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
    styles: []
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

    onGenerate() {
        this.generateCaptions.emit();
    }
}
