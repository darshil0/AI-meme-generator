import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { StorageService } from '../../services/storage.service';
import {
  CaptionTone,
  ImageFilter,
  MemeTemplate,
  TextLayer,
  IMAGE_FILTER_CSS_MAP,
  SavedMemeState,
  MEME_CONSTANTS,
} from '../../models/meme.model';
import { CanvasUtils } from '../../utils/canvas-utils';
import { TemplateGridComponent } from '../template-grid/template-grid.component';
import { AiCaptionsComponent } from '../ai-captions/ai-captions.component';
import { LayerControlsComponent } from '../layer-controls/layer-controls.component';
import { FilterControlsComponent } from '../filter-controls/filter-controls.component';

@Component({
  selector: 'app-meme-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TemplateGridComponent,
    AiCaptionsComponent,
    LayerControlsComponent,
    FilterControlsComponent,
  ],
  templateUrl: './meme-editor.component.html',
  styleUrls: ['./meme-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemeEditorComponent {
  @ViewChild('imagePreview') imagePreview?: ElementRef<HTMLImageElement>;

  private geminiService = inject(GeminiService);
  private storageService = inject(StorageService);

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
  imageFilter = signal<ImageFilter>(ImageFilter.NONE);
  filters: ImageFilter[] = [
    ImageFilter.NONE,
    ImageFilter.GRAYSCALE,
    ImageFilter.SEPIA,
    ImageFilter.INVERT,
    ImageFilter.BLUR,
    ImageFilter.BRIGHTNESS,
    ImageFilter.CONTRAST,
  ];

  // Caption tone signals
  selectedTone = signal<CaptionTone>(CaptionTone.HUMOROUS);
  tones: CaptionTone[] = [
    CaptionTone.HUMOROUS,
    CaptionTone.SARCASTIC,
    CaptionTone.WHOLESOME,
    CaptionTone.ABSURD,
    CaptionTone.DARK,
    CaptionTone.PROFESSIONAL,
    CaptionTone.POETIC,
  ];
  userContext = signal('');

  // Custom Template signals
  customTemplates = signal<MemeTemplate[]>([]);
  showSaveTemplateInput = signal(false);
  newTemplateName = signal('');
  templateSearchQuery = signal('');

  // In-memory cache for template data
  private templateCache = new Map<string, { data: string; mimeType: string }>();
  private imageDimensions = signal<{ width: number; height: number } | null>(null);

  // Limits
  private readonly maxCustomTemplates = MEME_CONSTANTS.MAX_CUSTOM_TEMPLATES;

  // Computed Signals
  hasImage = computed(() => !!this.selectedImage());
  isEditing = computed(() => this.hasImage() || this.loadingPreviewUrl() !== null);

  filteredTemplates = computed(() => {
    const all = [...this.defaultTemplates, ...this.customTemplates()];
    const query = this.templateSearchQuery().toLowerCase().trim();
    if (!query) return all;
    return all.filter((template) => template.name.toLowerCase().includes(query));
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
    return IMAGE_FILTER_CSS_MAP[filter] || IMAGE_FILTER_CSS_MAP[ImageFilter.NONE];
  });

  defaultTemplates: MemeTemplate[] = [
    { name: 'Surprised Pikachu', url: '/api/template-image?url=https://i.imgur.com/2N2gM4i.jpg' },
    { name: 'Doge', url: '/api/template-image?url=https://i.imgur.com/Vb69B6Y.jpg' },
    {
      name: 'Distracted Boyfriend',
      url: '/api/template-image?url=https://i.imgur.com/vH12S57.jpg',
    },
    {
      name: 'Woman Yelling at Cat',
      url: '/api/template-image?url=https://i.imgur.com/hPqvA8x.jpg',
    },
    { name: 'Is This a Pigeon?', url: '/api/template-image?url=https://i.imgur.com/sSwhLMB.jpg' },
    { name: 'Two Buttons', url: '/api/template-image?url=https://i.imgur.com/3sU6n2p.jpg' },
    { name: '"This is Fine" Dog', url: '/api/template-image?url=https://i.imgur.com/c4jt321.png' },
    { name: 'Drake Hotline Bling', url: '/api/template-image?url=https://i.imgur.com/GfO5UsK.jpg' },
    {
      name: 'Hide the Pain Harold',
      url: '/api/template-image?url=https://i.imgur.com/p5A2Yv0.jpg',
    },
    { name: '"Change My Mind"', url: '/api/template-image?url=https://i.imgur.com/s15dBTA.jpg' },
    { name: 'Expanding Brain', url: '/api/template-image?url=https://i.imgur.com/2JsV43k.jpg' },
    { name: 'Mocking SpongeBob', url: '/api/template-image?url=https://i.imgur.com/8z8vX9p.jpg' },
    { name: 'Success Kid', url: '/api/template-image?url=https://i.imgur.com/7kJ2z4m.jpg' },
  ];

  constructor() {
    // Optimistically set to true, then check with backend
    this.isApiKeyConfigured.set(true);
    this.geminiService.checkConfiguration().then((configured) => {
      this.isApiKeyConfigured.set(configured);
    });

    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    await this.storageService.migrateFromLocalStorage(['customMemeTemplates', 'savedMemeState']);
    await this.loadCustomTemplates();
    await this.checkForSavedState();
  }

  private async loadCustomTemplates(): Promise<void> {
    const templates = await this.storageService.getItem<MemeTemplate[]>('customMemeTemplates');
    if (templates) {
      this.customTemplates.set(templates.filter((t) => t.isCustom));
    }
  }

  private async checkForSavedState(): Promise<void> {
    const savedState = await this.storageService.getItem<SavedMemeState>('savedMemeState');
    this.savedStateExists.set(!!savedState);
  }

  // Layer Style Helpers
  getLayerTextShadow(layer: TextLayer): string {
    return CanvasUtils.getLayerTextShadow(layer);
  }

  getLayerTextFilter(layer: TextLayer): string {
    return CanvasUtils.getLayerTextFilter(layer);
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
    this.nextLayerId.update((id) => id + 1);

    const bottomLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'BOTTOM TEXT',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0.5,
      top: 100 - padding,
    };
    this.nextLayerId.update((id) => id + 1);

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
    this.imageFilter.set(ImageFilter.NONE);
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
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    // Validate MIME type against supported list
    if (
      !MEME_CONSTANTS.SUPPORTED_MIME_TYPES.includes(
        file.type as (typeof MEME_CONSTANTS.SUPPORTED_MIME_TYPES)[number],
      )
    ) {
      this.error.set('Unsupported image type. Please use JPG, PNG, GIF, WebP, BMP, or SVG.');
      return;
    }

    // Validate file size
    if (file.size > MEME_CONSTANTS.MAX_FILE_SIZE) {
      this.error.set(
        `File size must be less than ${MEME_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB.`,
      );
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
    const cached = this.templateCache.get(template.url);
    if (cached) {
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
      this.error.set(
        'Could not load template image (possibly blocked by CORS). You can still generate captions.',
      );
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
    const currentLayers = this.layers();
    if (currentLayers.length >= MEME_CONSTANTS.MAX_LAYERS) {
      this.error.set(`You can only have up to ${MEME_CONSTANTS.MAX_LAYERS} text layers.`);
      return;
    }

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

    this.layers.update((layers) => [...layers, newLayer]);
    this.nextLayerId.update((id) => id + 1);
    this.selectedLayerIndex.set(this.layers().length - 1);
  }

  deleteLayer(index: number, event?: Event): void {
    event?.stopPropagation();
    const currentIndex = this.selectedLayerIndex();

    this.layers.update((layers) => layers.filter((_, i) => i !== index));

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

  updateSelectedLayerProperty(property: string, value: any) {
    const index = this.selectedLayerIndex();
    if (index === null) return;

    this.layers.update((layers) => {
      const newLayers = [...layers];
      newLayers[index] = { ...newLayers[index], [property]: value };
      return newLayers;
    });
  }

  handleLayerUpdate(event: { property: string; value: any }) {
    this.updateSelectedLayerProperty(event.property, event.value);
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

      const selectedImage = this.selectedImage();
      if (selectedImage?.data) {
        captions = await this.geminiService.generateMemeCaptions(
          selectedImage.data,
          selectedImage.mimeType,
          this.selectedTone(),
          this.userContext(),
        );
      } else {
        const templateName = this.selectedTemplateName();
        if (!templateName) {
          this.error.set('Please select a template first.');
          return;
        }
        captions = await this.geminiService.generateCaptionsFromText(
          templateName,
          this.selectedTone(),
          this.userContext(),
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
    this.layers.update((layers) => {
      if (layers.length === 0) return layers;

      const newLayers = [...layers];
      newLayers[0] = { ...newLayers[0], text: parts[0]?.trim() || '' };

      if (newLayers.length > 1 && parts[1]) {
        newLayers[1] = { ...newLayers[1], text: parts.slice(1).join(' ').trim() };
      }

      return newLayers;
    });
  }

  async downloadMeme(): Promise<void> {
    const preview = this.imagePreview?.nativeElement;
    if (!preview?.src) {
      this.error.set('Cannot generate meme. Please ensure an image is loaded.');
      return;
    }

    const canvas = await CanvasUtils.generateMemeCanvas(
      preview.src,
      this.layers(),
      this.imageFilter(),
    );

    if (!canvas) {
      this.error.set('Failed to generate meme canvas.');
      return;
    }

    const quality = this.downloadQuality();
    const dataUrl = CanvasUtils.canvasToDataUrl(canvas, quality);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `meme-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async copyMemeToClipboard(): Promise<void> {
    // Ensure Clipboard API and ClipboardItem are available
    if (!navigator.clipboard?.write || typeof (window as any).ClipboardItem === 'undefined') {
      this.error.set(
        'Clipboard image copy is not supported in this browser. Use download instead.',
      );
      return;
    }

    const preview = this.imagePreview?.nativeElement;
    if (!preview?.src) {
      this.error.set('Cannot copy meme. Please ensure an image is loaded.');
      return;
    }

    const canvas = await CanvasUtils.generateMemeCanvas(
      preview.src,
      this.layers(),
      this.imageFilter(),
    );

    if (!canvas) {
      this.error.set('Failed to generate meme canvas.');
      return;
    }

    const blob = await CanvasUtils.canvasToBlob(canvas, 'image/png');
    if (!blob) {
      this.error.set('Failed to copy. Unable to create image blob.');
      return;
    }

    try {
      const ClipboardItemCtor = (window as any).ClipboardItem as typeof ClipboardItem;
      await navigator.clipboard.write([new ClipboardItemCtor({ 'image/png': blob })]);
      this.copyButtonText.set('✅ Copied!');
      setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 3000);
    } catch (error) {
      this.error.set('Failed to copy. Use download button instead.');
      console.error('Clipboard error:', error);
    }
  }

  async saveState(): Promise<void> {
    if (!this.isEditing()) return;

    const selectedImage = this.selectedImage();
    const dimensions = this.imageDimensions();

    const state: SavedMemeState = {
      version: 1,
      selectedImage:
        selectedImage && dimensions
          ? {
            url: selectedImage.url,
            data: selectedImage.data,
            mimeType: selectedImage.mimeType,
            dimensions: dimensions,
          }
          : null,
      layers: this.layers(),
      imageFilter: this.imageFilter(),
      selectedTemplateName: this.selectedTemplateName(),
      userContext: this.userContext(),
      selectedTone: this.selectedTone(),
      downloadQuality: this.downloadQuality(),
      nextLayerId: this.nextLayerId(),
      timestamp: new Date().toISOString(),
    };

    try {
      await this.storageService.setItem('savedMemeState', state);
      this.savedStateExists.set(true);
      this.saveButtonText.set('💾 Saved!');
      setTimeout(() => this.saveButtonText.set('Save Work'), 2000);
    } catch (error) {
      this.error.set('Failed to save state. Storage might be full.');
    }
  }

  async loadState(): Promise<void> {
    try {
      const state = await this.storageService.getItem<SavedMemeState>('savedMemeState');
      if (!state) throw new Error('No saved state found');

      this._resetEditorState(state.selectedTemplateName !== null);

      // Handle migration from old state format (without version/dimensions)
      if (state.selectedImage) {
        if ('dimensions' in state.selectedImage && state.selectedImage.dimensions) {
          // New format with dimensions
          this.selectedImage.set({
            url: state.selectedImage.url,
            data: state.selectedImage.data,
            mimeType: state.selectedImage.mimeType,
          });
          this.imageDimensions.set(state.selectedImage.dimensions);
        } else {
          // Old format - try to reconstruct without dimensions
          this.selectedImage.set({
            url: (state.selectedImage as any).url,
            data: (state.selectedImage as any).data,
            mimeType: (state.selectedImage as any).mimeType,
          });
          // Dimensions will be set when image loads
        }
      } else {
        this.selectedImage.set(null);
      }

      this.layers.set(state.layers || []);
      this.imageFilter.set(state.imageFilter || ImageFilter.NONE);
      this.selectedTemplateName.set(state.selectedTemplateName);
      this.userContext.set(state.userContext || '');
      this.selectedTone.set(state.selectedTone || CaptionTone.HUMOROUS);
      this.downloadQuality.set(state.downloadQuality || MEME_CONSTANTS.DEFAULT_QUALITY);
      this.nextLayerId.set(state.nextLayerId || 1);

      this.error.set(null);
    } catch {
      this.error.set('Failed to load state. Starting fresh.');
      await this.storageService.removeItem('savedMemeState');
      this.savedStateExists.set(false);
    }
  }

  async saveCustomTemplate(): Promise<void> {
    const name = this.newTemplateName().trim();
    const image = this.selectedImage();

    if (!name || !image?.data) {
      this.error.set('Need both image and template name.');
      return;
    }

    if (this.customTemplates().length >= this.maxCustomTemplates) {
      this.error.set(
        `You can only save up to ${this.maxCustomTemplates} custom templates. Delete some before adding more.`,
      );
      return;
    }

    if (this.filteredTemplates().some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      this.error.set('Template name already exists.');
      return;
    }

    const newTemplate: MemeTemplate = {
      name,
      url: `data:${image.mimeType};base64,${image.data}`,
      isCustom: true,
    };

    const updated = [...this.customTemplates(), newTemplate];
    await this.storageService.setItem('customMemeTemplates', updated);
    this.customTemplates.set(updated);

    this.newTemplateName.set('');
    this.showSaveTemplateInput.set(false);
    this.error.set(null);
  }

  async deleteCustomTemplate(template: MemeTemplate, event?: Event): Promise<void> {
    event?.stopPropagation();

    const updated = this.customTemplates().filter((t) => t.url !== template.url);
    await this.storageService.setItem('customMemeTemplates', updated);
    this.customTemplates.set(updated);

    if (this.selectedImage()?.url === template.url) {
      this._resetEditorState();
    }
  }

  async clearSavedMemeState(): Promise<void> {
    await this.storageService.removeItem('savedMemeState');
    this.savedStateExists.set(false);
    this._resetEditorState();
  }

  async clearAllCustomTemplates(): Promise<void> {
    await this.storageService.removeItem('customMemeTemplates');
    this.customTemplates.set([]);

    const selected = this.selectedImage();
    if (selected && selected.url.startsWith('data:')) {
      // Selected image was likely a custom template; reset the editor.
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
