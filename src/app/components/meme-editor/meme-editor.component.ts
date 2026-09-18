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
import { ExportService } from '../../services/export.service';

/**
 * Main orchestrator component for meme creation, editing, AI caption generation,
 * text layer manipulation, dark mode toggling, state persistence, and exporting.
 */
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
  /** ViewChild reference to the rendered HTMLImageElement preview */
  @ViewChild('imagePreview') imagePreview?: ElementRef<HTMLImageElement>;

  private geminiService = inject(GeminiService);
  private storageService = inject(StorageService);
  exportService = inject(ExportService);

  // State Signals
  /** Selected image state holding data URL, raw base64 data, and MIME type */
  selectedImage = signal<{ url: string; data: string; mimeType: string } | null>(null);
  /** Generated AI captions list */
  captions = signal<string[]>([]);
  /** Loading state indicator for AI caption requests */
  isLoading = signal(false);
  /** Template URL currently being fetched */
  loadingTemplateUrl = signal<string | null>(null);
  /** Active error message string */
  error = signal<string | null>(null);
  /** Flag indicating if backend Gemini API key is configured */
  isApiKeyConfigured = signal(false);
  /** Upload progress percentage (0-100) or null */
  uploadProgress = signal<number | null>(null);
  /** Selected template display name */
  selectedTemplateName = signal<string | null>(null);
  /** Loading preview URL */
  loadingPreviewUrl = signal<string | null>(null);
  /** Save work button text state */
  saveButtonText = signal('Save Work');
  /** Flag indicating if saved state exists in storage */
  savedStateExists = signal(false);
  /** JPEG download export quality value */
  downloadQuality = signal<number>(0.92);
  /** Active theme state (true for dark mode, false for light mode) */
  isDarkMode = signal(true);

  /** Quality preset dropdown options */
  downloadQualities = [
    { label: 'High (Original)', value: 0.95 },
    { label: 'High', value: 0.92 },
    { label: 'Medium', value: 0.75 },
    { label: 'Low', value: 0.5 },
  ] as const;

  // Layer management signals
  /** Canvas text layers list */
  layers = signal<TextLayer[]>([]);
  /** Index of currently selected text layer */
  selectedLayerIndex = signal<number | null>(null);
  /** Counter for generating unique layer IDs */
  private nextLayerId = signal(1);

  // Image filter signals
  /** Active CSS image filter selection */
  imageFilter = signal<ImageFilter>(ImageFilter.NONE);
  /** Available filter options list */
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
  /** Selected AI caption tone */
  selectedTone = signal<CaptionTone>(CaptionTone.HUMOROUS);
  /** Available caption tone presets */
  tones: CaptionTone[] = [
    CaptionTone.HUMOROUS,
    CaptionTone.SARCASTIC,
    CaptionTone.WHOLESOME,
    CaptionTone.ABSURD,
    CaptionTone.DARK,
    CaptionTone.PROFESSIONAL,
    CaptionTone.POETIC,
  ];
  /** User context input text for AI captions */
  userContext = signal('');

  // Custom Template signals
  /** Saved custom template list */
  customTemplates = signal<MemeTemplate[]>([]);
  /** Visibility toggle for custom template save form */
  showSaveTemplateInput = signal(false);
  /** Input name for saving new custom template */
  newTemplateName = signal('');
  /** Template search query string */
  templateSearchQuery = signal('');

  // In-memory cache for template data
  private templateCache = new Map<string, { data: string; mimeType: string }>();
  private imageDimensions = signal<{ width: number; height: number } | null>(null);

  // Limits
  private readonly maxCustomTemplates = MEME_CONSTANTS.MAX_CUSTOM_TEMPLATES;

  // Computed Signals
  /** Computed flag evaluating whether an image is selected */
  hasImage = computed(() => !!this.selectedImage());
  /** Computed flag evaluating whether editor has an active image or loading preview */
  isEditing = computed(() => this.hasImage() || this.loadingPreviewUrl() !== null);

  /** Filtered templates list matching user search query */
  filteredTemplates = computed(() => {
    const all = [...this.defaultTemplates, ...this.customTemplates()];
    const query = this.templateSearchQuery().toLowerCase().trim();
    if (!query) return all;
    return all.filter((template) => template.name.toLowerCase().includes(query));
  });

  /** Configuration object for currently selected layer */
  selectedLayer = computed(() => {
    const index = this.selectedLayerIndex();
    const currentLayers = this.layers();
    return index !== null && index >= 0 && index < currentLayers.length
      ? currentLayers[index]
      : null;
  });

  /** CSS filter property string computed for active selection */
  computedImageFilter = computed(() => {
    const filter = this.imageFilter();
    return IMAGE_FILTER_CSS_MAP[filter] || IMAGE_FILTER_CSS_MAP[ImageFilter.NONE];
  });

  /** Stock template library list */
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
    this.isApiKeyConfigured.set(true);
    this.geminiService.checkConfiguration().then((configured) => {
      this.isApiKeyConfigured.set(configured);
    });

    this.initializeStorage();
  }

  /**
   * Toggles dark/light application theme and persists preference to IndexedDB.
   */
  toggleDarkMode(): void {
    this.isDarkMode.update((v) => !v);
    this.updateDarkMode();
  }

  /**
   * Applies active dark mode class to document root element and saves theme state.
   */
  private updateDarkMode(): void {
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.storageService.setItem('darkMode', this.isDarkMode());
  }

  /**
   * Initializes persistent storage, performs LocalStorage migration, and loads state.
   */
  private async initializeStorage(): Promise<void> {
    await this.storageService.migrateFromLocalStorage([
      'customMemeTemplates',
      'savedMemeState',
      'darkMode',
    ]);
    const darkMode = await this.storageService.getItem<boolean>('darkMode');
    if (darkMode !== null) {
      this.isDarkMode.set(darkMode);
    }
    this.updateDarkMode();

    await this.loadCustomTemplates();
    await this.checkForSavedState();
  }

  /** Loads custom saved user templates from IndexedDB */
  private async loadCustomTemplates(): Promise<void> {
    const templates = await this.storageService.getItem<MemeTemplate[]>('customMemeTemplates');
    if (templates) {
      this.customTemplates.set(templates.filter((t) => t.isCustom));
    }
  }

  /** Checks IndexedDB for saved editor state */
  private async checkForSavedState(): Promise<void> {
    const savedState = await this.storageService.getItem<SavedMemeState>('savedMemeState');
    this.savedStateExists.set(!!savedState);
  }

  /**
   * Calculates layer text shadow CSS rule.
   * @param layer Text layer configuration.
   */
  getLayerTextShadow(layer: TextLayer): string {
    return CanvasUtils.getLayerTextShadow(layer);
  }

  /**
   * Calculates layer filter CSS rule.
   * @param layer Text layer configuration.
   */
  getLayerTextFilter(layer: TextLayer): string {
    return CanvasUtils.getLayerTextFilter(layer);
  }

  /** Retrieves natural pixel dimensions of selected image preview */
  private getImageDimensions(): { width: number; height: number } | null {
    const img = this.imagePreview?.nativeElement;
    return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
  }

  /**
   * Initializes default top and bottom text layers for a newly loaded image.
   * @param imageWidth Natural pixel width of the loaded image.
   */
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

  /** Resets editor state signals */
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

  /** Finalizes image loading, measures dimensions, and initializes text layers */
  private _finalizeImageSelection(dataUrl: string, mimeType: string): void {
    const base64Data = dataUrl.split(',', 2)[1] ?? '';
    this.selectedImage.set({ url: dataUrl, data: base64Data, mimeType });
    this.uploadProgress.set(null);
    this.loadingTemplateUrl.set(null);
    this.loadingPreviewUrl.set(null);

    const img = new Image();
    img.onload = () => {
      this.imageDimensions.set({ width: img.naturalWidth, height: img.naturalHeight });
      this.initializeLayers(img.naturalWidth);
    };
    img.src = dataUrl;
  }

  /**
   * Handles user image upload file selection event.
   * @param event File input change event.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    if (
      !MEME_CONSTANTS.SUPPORTED_MIME_TYPES.includes(
        file.type as (typeof MEME_CONSTANTS.SUPPORTED_MIME_TYPES)[number],
      )
    ) {
      this.error.set('Unsupported image type. Please use JPG, PNG, GIF, WebP, BMP, or SVG.');
      return;
    }

    if (file.size > MEME_CONSTANTS.MAX_FILE_SIZE) {
      this.error.set(
        `File size must be less than ${MEME_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB.`,
      );
      return;
    }

    this._resetEditorState();
    this.uploadProgress.set(0);
    input.value = '';

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

  /**
   * Selects and loads a meme template image.
   * @param template Template object to load.
   */
  async selectTemplate(template: MemeTemplate): Promise<void> {
    this._resetEditorState(true);
    this.selectedTemplateName.set(template.name);
    this.error.set(null);

    if (template.isCustom) {
      const match = template.url.match(/^data:(.+?);base64,/);
      if (match) {
        this._finalizeImageSelection(template.url, match[1]);
        return;
      }
    }

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

  /** Loads image binary data URL via HTML Canvas */
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

  /**
   * Sets the active selected text layer by index.
   * @param index Layer index.
   */
  selectLayer(index: number): void {
    this.selectedLayerIndex.set(this.selectedLayerIndex() === index ? null : index);
  }

  /** Adds a new text layer to the meme canvas */
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

  /**
   * Deletes a text layer by index.
   * @param index Layer index.
   * @param event Event trigger.
   */
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

  /**
   * Reorders a text layer up or down in rendering order.
   * @param index Layer index.
   * @param direction Order direction ('up' or 'down').
   * @param event Trigger event.
   */
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

  /** Updates a property value on the active selected layer */
  updateSelectedLayerProperty<K extends keyof TextLayer>(property: K, value: TextLayer[K]): void {
    const index = this.selectedLayerIndex();
    if (index === null) return;

    this.layers.update((layers) => {
      const newLayers = [...layers];
      newLayers[index] = { ...newLayers[index], [property]: value };
      return newLayers;
    });
  }

  /** Handler for layer property update event emitted from child component */
  handleLayerUpdate(event: { property: string; value: string | number }): void {
    this.updateSelectedLayerProperty(event.property as keyof TextLayer, event.value as never);
  }

  /** Triggers Gemini AI caption generation for selected image or template name */
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

      this.captions.set(captions.slice(0, 10));
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to generate captions.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Applies a suggested AI caption string across text layers.
   * @param caption AI caption text string.
   */
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

  /** Exports and downloads rendered meme as a JPEG image file */
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

    await this.exportService.downloadMeme(canvas, this.downloadQuality());
  }

  /** Copies rendered meme canvas directly to the system clipboard */
  async copyMemeToClipboard(): Promise<void> {
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

    const success = await this.exportService.copyToClipboard(canvas);
    if (!success) {
      this.error.set('Failed to copy. Try downloading instead.');
    }
  }

  /** Saves active editor work state to IndexedDB */
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
    } catch {
      this.error.set('Failed to save state. Storage might be full.');
    }
  }

  /** Loads saved editor work state from IndexedDB */
  async loadState(): Promise<void> {
    try {
      const state = await this.storageService.getItem<SavedMemeState>('savedMemeState');
      if (!state) throw new Error('No saved state found');

      this._resetEditorState(state.selectedTemplateName !== null);

      if (state.selectedImage) {
        this.selectedImage.set({
          url: state.selectedImage.url,
          data: state.selectedImage.data,
          mimeType: state.selectedImage.mimeType,
        });

        if (state.selectedImage.dimensions) {
          this.imageDimensions.set(state.selectedImage.dimensions);
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

  /** Saves uploaded image as a custom reusable template in IndexedDB */
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

  /**
   * Deletes a custom user template from IndexedDB.
   * @param template Template object to delete.
   * @param event Trigger event.
   */
  async deleteCustomTemplate(template: MemeTemplate, event?: Event): Promise<void> {
    event?.stopPropagation();

    const updated = this.customTemplates().filter((t) => t.url !== template.url);
    await this.storageService.setItem('customMemeTemplates', updated);
    this.customTemplates.set(updated);

    if (this.selectedImage()?.url === template.url) {
      this._resetEditorState();
    }
  }

  /** Clears saved meme work session state from IndexedDB */
  async clearSavedMemeState(): Promise<void> {
    await this.storageService.removeItem('savedMemeState');
    this.savedStateExists.set(false);
    this._resetEditorState();
  }

  /** Clears all custom templates saved by user from IndexedDB */
  async clearAllCustomTemplates(): Promise<void> {
    await this.storageService.removeItem('customMemeTemplates');
    this.customTemplates.set([]);

    const selected = this.selectedImage();
    if (selected && selected.url.startsWith('data:')) {
      this._resetEditorState();
    }
  }

  /**
   * Applies an image filter to the background image.
   * @param filter ImageFilter enum choice.
   */
  applyFilter(filter: ImageFilter): void {
    this.imageFilter.set(filter);
  }

  /**
   * Selects an AI caption tone option.
   * @param tone CaptionTone enum choice.
   */
  selectTone(tone: CaptionTone): void {
    this.selectedTone.set(tone);
  }
}
