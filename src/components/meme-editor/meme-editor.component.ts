import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import {
  CaptionTone,
  ImageFilter,
  MemeTemplate,
  TextLayer,
} from '../../models/meme.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SavedMemeState {
  selectedImage: { url: string; data: string; mimeType: string } | null;
  layers: TextLayer[];
  imageFilter: ImageFilter;
  selectedTemplateName: string | null;
  userContext: string;
  selectedTone: CaptionTone;
  downloadQuality: number;
  nextLayerId: number;
}

@Component({
  selector: 'app-meme-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meme-editor.component.html',
  styleUrls: ['./meme-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemeEditorComponent {
  @ViewChild('imagePreview') imagePreview!: ElementRef<HTMLImageElement>;

  private geminiService = inject(GeminiService);
  private destroyRef = inject(DestroyRef);

  // State Signals
  selectedImage = signal<{ url: string; data: string; mimeType: string } | null>(null);
  captions = signal<string[]>([]);
  isLoading = signal(false);
  loadingTemplateUrl = signal<string | null>(null);
  error = signal<string | null>(null);
  isApiKeyConfigured = signal(false);
  uploadProgress = signal<number | null>(null);
  selectedTemplateName = signal<string | null>(null);
  loadingPreviewUrl = signal<string | null>(null);
  copyButtonText = signal('Copy to Clipboard');
  saveButtonText = signal('Save Work');
  savedStateExists = signal(false);
  downloadQuality = signal<number>(0.92);

  downloadQualities = [
    { label: 'High (Original)', value: 0.95 },
    { label: 'High', value: 0.92 },
    { label: 'Medium', value: 0.75 },
    { label: 'Low', value: 0.5 },
  ] as const;

  // Layer management signals
  layers = signal<TextLayer[]>([]);
  selectedLayerIndex = signal<number | null>(null);
  private nextLayerId = signal(1);

  // Image filter signals
  imageFilter = signal<ImageFilter>('none');
  filters: ImageFilter[] = ['none', 'grayscale', 'sepia', 'invert', 'blur', 'brightness', 'contrast'];

  // Caption tone signals
  selectedTone = signal<CaptionTone>('humorous');
  tones: CaptionTone[] = ['humorous', 'sarcastic', 'wholesome', 'absurd', 'dark', 'professional', 'poetic'];
  userContext = signal('');

  // Custom Template signals
  customTemplates = signal<MemeTemplate[]>([]);
  showSaveTemplateInput = signal(false);
  newTemplateName = signal('');
  templateSearchQuery = signal('');

  // In-memory cache for template data
  private templateCache = new Map<string, { data: string; mimeType: string }>();
  private imageDimensions = signal<{ width: number; height: number } | null>(null);

  // Computed Signals
  hasImage = computed(() => !!this.selectedImage());
  isEditing = computed(() => this.hasImage() || this.loadingPreviewUrl() !== null);
  
  filteredTemplates = computed(() => {
    const all = [...this.defaultTemplates, ...this.customTemplates()];
    const query = this.templateSearchQuery().toLowerCase().trim();
    if (!query) return all;
    return all.filter((template) =>
      template.name.toLowerCase().includes(query),
    );
  });

  selectedLayer = computed(() => {
    const index = this.selectedLayerIndex();
    const currentLayers = this.layers();
    return index !== null && index >= 0 && index < currentLayers.length 
      ? currentLayers[index] 
      : null;
  });

  computedImageFilter = computed(() => {
    const filter = this.imageFilter();
    const filters: Record<ImageFilter, string> = {
      none: 'none',
      grayscale: 'grayscale(100%)',
      sepia: 'sepia(85%) saturate(200%)',
      invert: 'invert(100%)',
      blur: 'blur(2px)',
      brightness: 'brightness(150%)',
      contrast: 'contrast(150%)',
    };
    return filters[filter] || 'none';
  });

  defaultTemplates: MemeTemplate[] = [
    { name: 'Surprised Pikachu', url: 'https://i.imgur.com/2N2gM4i.jpg' },
    { name: 'Doge', url: 'https://i.imgur.com/Vb69B6Y.jpg' },
    { name: 'Distracted Boyfriend', url: 'https://i.imgur.com/vH12S57.jpg' },
    { name: 'Woman Yelling at Cat', url: 'https://i.imgur.com/hPqvA8x.jpg' },
    { name: 'Is This a Pigeon?', url: 'https://i.imgur.com/sSwhLMB.jpg' },
    { name: 'Two Buttons', url: 'https://i.imgur.com/3sU6n2p.jpg' },
    { name: '"This is Fine" Dog', url: 'https://i.imgur.com/c4jt321.png' },
    { name: 'Drake Hotline Bling', url: 'https://i.imgur.com/GfO5UsK.jpg' },
    { name: 'Hide the Pain Harold', url: 'https://i.imgur.com/p5A2Yv0.jpg' },
    { name: '"Change My Mind"', url: 'https://i.imgur.com/s15dBTA.jpg' },
    { name: 'Expanding Brain', url: 'https://i.imgur.com/2JsV43k.jpg' },
    { name: 'Mocking SpongeBob', url: 'https://i.imgur.com/8z8vX9p.jpg' },
    { name: 'Success Kid', url: 'https://i.imgur.com/7kJ2z4m.jpg' },
  ];

  constructor() {
    this.isApiKeyConfigured.set(this.geminiService.isConfigured());
    this.loadCustomTemplates();
    this.checkForSavedState();
    
    // Debounced template search
    effect(() => {
      this.templateSearchQuery();
      // Trigger recomputation of filtered templates
    }, { allowSignalWrites: true });
  }

  private loadCustomTemplates(): void {
    const savedTemplates = localStorage.getItem('customMemeTemplates');
    if (savedTemplates) {
      try {
        const templates = JSON.parse(savedTemplates) as MemeTemplate[];
        this.customTemplates.set(templates.filter(t => t.isCustom));
      } catch (e) {
        console.error('Failed to parse custom templates:', e);
      }
    }
  }

  private checkForSavedState(): void {
    const savedState = localStorage.getItem('savedMemeState');
    this.savedStateExists.set(!!savedState);
  }

  // Layer Style Helpers
  getLayerTextShadow(layer: TextLayer): string {
    const color = layer.outlineColor;
    const width = Math.max(1, Math.round(layer.fontSize / 24));
    const shadows = [
      `-${width}px -${width}px 0 ${color}`,
      `${width}px -${width}px 0 ${color}`,
      `-${width}px ${width}px 0 ${color}`,
      `${width}px ${width}px 0 ${color}`,
      `0 0 ${Math.max(1, width * 2)}px rgba(0,0,0,0.5)`,
    ];
    return shadows.join(', ');
  }

  getLayerTextFilter(layer: TextLayer): string {
    return layer.textBlur > 0 ? `blur(${layer.textBlur}px)` : 'none';
  }

  private getImageDimensions(): { width: number; height: number } | null {
    const img = this.imagePreview?.nativeElement;
    return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
  }

  initializeLayers(imageWidth: number): void {
    this.nextLayerId.set(1);
    const baseFontSize = Math.max(Math.round(imageWidth / 18), 36);
    const padding = 8;

    const topLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'TOP TEXT',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0.5,
      top: padding,
    };
    this.nextLayerId.update(id => id + 1);

    const bottomLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'BOTTOM TEXT',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0.5,
      top: 100 - padding,
    };
    this.nextLayerId.update(id => id + 1);

    this.layers.set([topLayer, bottomLayer]);
    this.selectedLayerIndex.set(0);
  }

  private _resetEditorState(keepTemplateName = false): void {
    this.error.set(null);
    this.selectedImage.set(null);
    this.captions.set([]);
    this.uploadProgress.set(null);
    if (!keepTemplateName) {
      this.selectedTemplateName.set(null);
    }
    this.imageFilter.set('none');
    this.showSaveTemplateInput.set(false);
    this.loadingPreviewUrl.set(null);
    this.layers.set([]);
    this.selectedLayerIndex.set(null);
    this.imageDimensions.set(null);
  }

  private _finalizeImageSelection(dataUrl: string, mimeType: string): void {
    const base64Data = dataUrl.split(',', 2)[1] ?? '';
    this.selectedImage.set({ url: dataUrl, data: base64Data, mimeType });
    this.uploadProgress.set(null);
    this.loadingTemplateUrl.set(null);
    this.loadingPreviewUrl.set(null);

    // Measure image dimensions
    const img = new Image();
    img.onload = () => {
      this.imageDimensions.set({ width: img.naturalWidth, height: img.naturalHeight });
      this.initializeLayers(img.naturalWidth);
    };
    img.src = dataUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.[0]) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file (JPG, PNG, GIF, WebP).');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.error.set('File size must be less than 10MB.');
      return;
    }

    this._resetEditorState();
    this.uploadProgress.set(0);
    input.value = ''; // Reset input

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        this.uploadProgress.set(Math.round((e.loaded / e.total!) * 100));
      }
    };
    reader.onload = () => this._finalizeImageSelection(reader.result as string, file.type);
    reader.onerror = () => {
      this.error.set('Failed to read file. Please try another image.');
      this.uploadProgress.set(null);
    };
    reader.readAsDataURL(file);
  }

  async selectTemplate(template: MemeTemplate): Promise<void> {
    this._resetEditorState(true);
    this.selectedTemplateName.set(template.name);
    this.error.set(null);

    // Custom template (data URL)
    if (template.isCustom) {
      const match = template.url.match(/^data:(.+?);base64,/);
      if (match) {
        this._finalizeImageSelection(template.url, match[1]);
        return;
      }
    }

    // Try cache first
    if (this.templateCache.has(template.url)) {
      const cached = this.templateCache.get(template.url)!;
      const dataUrl = `data:${cached.mimeType};base64,${cached.data}`;
      this._finalizeImageSelection(dataUrl, cached.mimeType);
      return;
    }

    if (this.loadingTemplateUrl()) return;

    this.loadingTemplateUrl.set(template.url);
    this.loadingPreviewUrl.set(template.url);

    try {
      const imageData = await this.loadImageData(template.url);
      if (imageData) {
        this.templateCache.set(template.url, imageData);
        const dataUrl = `data:${imageData.mimeType};base64,${imageData.data}`;
        this._finalizeImageSelection(dataUrl, imageData.mimeType);
      }
    } catch (error) {
      console.warn('Template load failed:', error);
      this.error.set('Could not load template image. You can still generate captions.');
      this.selectedImage.set({ url: template.url, data: '', mimeType: 'image/png' });
    } finally {
      this.loadingTemplateUrl.set(null);
      this.loadingPreviewUrl.set(null);
    }
  }

  private loadImageData(url: string): Promise<{ data: string; mimeType: string } | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL('image/png');
          const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
          if (match) {
            resolve({ data: match[2], mimeType: match[1] });
          } else {
            reject(new Error('Invalid data URL format'));
          }
        } catch {
          reject(new Error('Failed to convert image to data URL'));
        }
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  }

  // Layer Management
  selectLayer(index: number): void {
    this.selectedLayerIndex.set(this.selectedLayerIndex() === index ? null : index);
  }

  addTextLayer(): void {
    const dims = this.getImageDimensions();
    const baseFontSize = dims ? Math.max(Math.round(dims.width / 20), 36) : 48;

    const newLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'New Text Layer',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0,
      top: 50,
    };
    
    this.layers.update(layers => [...layers, newLayer]);
    this.nextLayerId.update(id => id + 1);
    this.selectedLayerIndex.set(this.layers().length - 1);
  }

  deleteLayer(index: number, event?: Event): void {
    event?.stopPropagation();
    const currentIndex = this.selectedLayerIndex();

    this.layers.update(layers => layers.filter((_, i) => i !== index));

    if (currentIndex === index) {
      this.selectedLayerIndex.set(null);
    } else if (currentIndex !== null && currentIndex > index) {
      this.selectedLayerIndex.set(currentIndex - 1);
    }
  }

  moveLayer(index: number, direction: 'up' | 'down', event?: Event): void {
    event?.stopPropagation();
    const layers = this.layers();
    
    if (direction === 'up' && index > 0) {
      const newLayers = [...layers];
      [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
      this.layers.set(newLayers);
      this.selectedLayerIndex.set(index - 1);
    } else if (direction === 'down' && index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index + 1], newLayers[index]] = [newLayers[index], newLayers[index + 1]];
      this.layers.set(newLayers);
      this.selectedLayerIndex.set(index + 1);
    }
  }

  updateSelectedLayerProperty<K extends keyof Omit<TextLayer, 'id'>>(prop: K, value: TextLayer[K]): void {
    const index = this.selectedLayerIndex();
    if (index === null) return;

    this.layers.update(layers => {
      const newLayers = [...layers];
      newLayers[index] = { ...newLayers[index], [prop]: value };
      return newLayers;
    });
  }

  async generateCaptions(): Promise<void> {
    if (!this.hasImage() && !this.selectedTemplateName()) {
      this.error.set('Please select an image or template first.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.captions.set([]);

    try {
      let captions: string[];
      
      if (this.selectedImage()?.data) {
        captions = await this.geminiService.generateMemeCaptions(
          this.selectedImage()!.data,
          this.selectedImage()!.mimeType,
          this.selectedTone(),
          this.userContext()
        );
      } else {
        captions = await this.geminiService.generateCaptionsFromText(
          this.selectedTemplateName()!,
          this.selectedTone(),
          this.userContext()
        );
      }

      this.captions.set(captions.slice(0, 10)); // Limit to 10 captions
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to generate captions.');
    } finally {
      this.isLoading.set(false);
    }
  }

  applyCaption(caption: string): void {
    const parts = caption.split(/[-|/]\s+|\s+\/\s+|\s+-\s+/i);
    this.layers.update(layers => {
      if (layers.length === 0) return layers;

      const newLayers = [...layers];
      newLayers[0] = { ...newLayers[0], text: parts[0]?.trim() || '' };

      if (newLayers.length > 1 && parts[1]) {
        newLayers[1] = { ...newLayers[1], text: parts.slice(1).join(' ').trim() };
      }

      return newLayers;
    });
  }

  private async _generateMemeCanvas(): Promise<HTMLCanvasElement | null> {
    const preview = this.imagePreview?.nativeElement;
    if (!preview?.src) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = preview.src;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Apply image filter
        ctx.filter = this.computedImageFilter();
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        // Draw text layers (back to front)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.imageSmoothingEnabled = true;

        for (const layer of this.layers()) {
          const lineWidth = Math.max(2, Math.round(layer.fontSize / 20));
          
          // Shadow for outline effect
          ctx.save();
          ctx.filter = this.getLayerTextFilter(layer);
          
          ctx.font = `${layer.fontSize}px Impact, Arial Black, sans-serif`;
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = lineWidth;
          ctx.fillStyle = layer.fontColor;
          
          const y = (layer.top / 100) * canvas.height;
          ctx.strokeText(layer.text, canvas.width / 2, y);
          ctx.fillText(layer.text, canvas.width / 2, y);
          
          ctx.restore();
        }

        resolve(canvas);
      };

      img.onerror = () => resolve(null);
    });
  }

  async downloadMeme(): Promise<void> {
    const canvas = await this._generateMemeCanvas();
    if (!canvas) {
      this.error.set('Cannot generate meme. Please ensure an image is loaded.');
      return;
    }

    const quality = this.downloadQuality();
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `meme-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async copyMemeToClipboard(): Promise<void> {
    if (!navigator.clipboard?.write) {
      this.error.set('Clipboard API not supported. Use download instead.');
      return;
    }

    const canvas = await this._generateMemeCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        this.copyButtonText.set('✅ Copied!');
        setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 3000);
      } catch (error) {
        this.error.set('Failed to copy. Use download button instead.');
        console.error('Clipboard error:', error);
      }
    }, 'image/png');
  }

  saveState(): void {
    if (!this.isEditing()) return;

    const state: SavedMemeState = {
      selectedImage: this.selectedImage(),
      layers: this.layers(),
      imageFilter: this.imageFilter(),
      selectedTemplateName: this.selectedTemplateName(),
      userContext: this.userContext(),
      selectedTone: this.selectedTone(),
      downloadQuality: this.downloadQuality(),
      nextLayerId: this.nextLayerId(),
    };

    try {
      localStorage.setItem('savedMemeState', JSON.stringify(state));
      this.savedStateExists.set(true);
      this.saveButtonText.set('💾 Saved!');
      setTimeout(() => this.saveButtonText.set('Save Work'), 2000);
    } catch (error) {
      this.error.set('Storage quota exceeded. Clear some space or use fewer custom templates.');
    }
  }

  loadState(): void {
    try {
      const saved = localStorage.getItem('savedMemeState');
      if (!saved) throw new Error('No saved state found');

      const state: SavedMemeState = JSON.parse(saved);
      
      this._resetEditorState(state.selectedTemplateName !== null);
      
      this.selectedImage.set(state.selectedImage);
      this.layers.set(state.layers || []);
      this.imageFilter.set(state.imageFilter || 'none');
      this.selectedTemplateName.set(state.selectedTemplateName);
      this.userContext.set(state.userContext || '');
      this.selectedTone.set(state.selectedTone || 'humorous');
      this.downloadQuality.set(state.downloadQuality || 0.92);
      this.nextLayerId.set(state.nextLayerId || 1);

      this.error.set(null);
    } catch (error) {
      this.error.set('Failed to load state. Starting fresh.');
      localStorage.removeItem('savedMemeState');
      this.savedStateExists.set(false);
    }
  }

  saveCustomTemplate(): void {
    const name = this.newTemplateName().trim();
    const image = this.selectedImage();

    if (!name || !image?.data) {
      this.error.set('Need both image and template name.');
      return;
    }

    if (this.filteredTemplates().some(t => t.name.toLowerCase() === name.toLowerCase())) {
      this.error.set('Template name already exists.');
      return;
    }

    const newTemplate: MemeTemplate = {
      name,
      url: `data:${image.mimeType};base64,${image.data}`,
      isCustom: true,
    };

    this.customTemplates.update(templates => {
      const updated = [...templates, newTemplate];
      localStorage.setItem('customMemeTemplates', JSON.stringify(updated));
      return updated;
    });

    this.newTemplateName.set('');
    this.showSaveTemplateInput.set(false);
    this.error.set(null);
  }

  deleteCustomTemplate(template: MemeTemplate, event?: Event): void {
    event?.stopPropagation();
    
    this.customTemplates.update(templates => {
      const updated = templates.filter(t => t.url !== template.url);
      localStorage.setItem('customMemeTemplates', JSON.stringify(updated));
      return updated;
    });

    if (this.selectedImage()?.url === template.url) {
      this._resetEditorState();
    }
  }

  applyFilter(filter: ImageFilter): void {
    this.imageFilter.set(filter);
  }

  selectTone(tone: CaptionTone): void {
    this.selectedTone.set(tone);
  }
}
