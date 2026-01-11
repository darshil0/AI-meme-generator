import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import {
  CaptionTone,
  ImageFilter,
  MemeTemplate,
  TextLayer,
} from '../../models/meme.model';

interface SavedMemeState {
  selectedImage: { url: string; data: string; mimeType: string } | null;
  layers: TextLayer[];
  imageFilter: ImageFilter;
  selectedTemplateName: string | null;
  userContext: string;
  selectedTone: CaptionTone;
}

@Component({
  selector: 'app-meme-editor',
  templateUrl: './meme-editor.component.html',
  styleUrls: ['./meme-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemeEditorComponent {
  @ViewChild('imagePreview') imagePreview!: ElementRef<HTMLImageElement>;

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
    { label: 'High', value: 0.92 },
    { label: 'Medium', value: 0.75 },
    { label: 'Low', value: 0.5 },
  ];

  // Layer management signals
  layers = signal<TextLayer[]>([]);
  selectedLayerIndex = signal<number | null>(null);
  private nextLayerId = signal(1);

  // Image filter signals
  imageFilter = signal<ImageFilter>('none');
  filters: ImageFilter[] = ['none', 'grayscale', 'sepia', 'invert'];

  // Caption tone signals
  selectedTone = signal<CaptionTone>('humorous');
  tones: CaptionTone[] = ['humorous', 'sarcastic', 'wholesome', 'absurd', 'dark'];
  userContext = signal('');

  // Custom Template signals
  customTemplates = signal<MemeTemplate[]>([]);
  showSaveTemplateInput = signal(false);
  newTemplateName = signal('');
  templateSearchQuery = signal('');

  // In-memory cache for template data
  private templateCache = new Map<string, { data: string; mimeType: string }>();

  // Computed Signals
  hasImage = computed(() => !!this.selectedImage());
  isEditing = computed(
    () => this.hasImage() || this.loadingPreviewUrl() !== null,
  );

  selectedLayer = computed(() => {
    const index = this.selectedLayerIndex();
    const currentLayers = this.layers();
    if (index !== null && index >= 0 && index < currentLayers.length) {
      return currentLayers[index];
    }
    return null;
  });

  computedImageFilter = computed(() => {
    const filter = this.imageFilter();
    switch (filter) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'sepia':
        return 'sepia(100%)';
      case 'invert':
        return 'invert(100%)';
      case 'none':
      default:
        return 'none';
    }
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
  ];

  templates = computed(() => {
    const all = [...this.defaultTemplates, ...this.customTemplates()];
    const query = this.templateSearchQuery().toLowerCase().trim();
    if (!query) return all;
    return all.filter((template) =>
      template.name.toLowerCase().includes(query),
    );
  });

  constructor(private geminiService: GeminiService) {
    this.isApiKeyConfigured.set(this.geminiService.isConfigured());
    const savedTemplates = localStorage.getItem('customMemeTemplates');
    if (savedTemplates) {
      try {
        this.customTemplates.set(JSON.parse(savedTemplates));
      } catch (e) {
        console.error(
          'Failed to parse custom templates from localStorage',
          e,
        );
      }
    }
    this.checkForSavedState();
  }
  
  private checkForSavedState(): void {
    const savedState = localStorage.getItem('savedMemeState');
    this.savedStateExists.set(!!savedState);
  }

  // Layer Style Helpers
  getLayerTextShadow(layer: TextLayer): string {
    const color = layer.outlineColor;
    const width = Math.max(1, Math.round(layer.fontSize / 24));
    return [
      `-${width}px -${width}px 0 ${color}`,
      `${width}px -${width}px 0 ${color}`,
      `-${width}px ${width}px 0 ${color}`,
      `${width}px ${width}px 0 ${color}`,
    ].join(', ');
  }

  getLayerTextFilter(layer: TextLayer): string {
    return layer.textBlur > 0 ? `blur(${layer.textBlur}px)` : 'none';
  }

  initializeLayers(imageWidth: number): void {
    this.nextLayerId.set(1);
    const baseFontSize = Math.round(Math.max(imageWidth / 15, 30));

    const topLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'Top Text',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0,
      top: 10,
    };
    this.nextLayerId.update((id) => id + 1);

    const bottomLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'Bottom Text',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0,
      top: 90,
    };
    this.nextLayerId.update((id) => id + 1);

    this.layers.set([topLayer, bottomLayer]);
    this.selectedLayerIndex.set(0);
  }

  private _resetEditorState(keepTemplateName: boolean = false): void {
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
  }

  private _finalizeImageSelection(dataUrl: string, mimeType: string): void {
    const base64Data = dataUrl.split(',', 2)[1] ?? '';
    this.selectedImage.set({ url: dataUrl, data: base64Data, mimeType });
    this.uploadProgress.set(null);
    this.loadingTemplateUrl.set(null);
    this.loadingPreviewUrl.set(null);

    const img = new Image();
    img.onload = () => this.initializeLayers(img.naturalWidth);
    img.onerror = () =>
      this.error.set(
        'Failed to load image preview to determine dimensions.',
      );
    img.src = dataUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file.');
      return;
    }

    this._resetEditorState();
    this.uploadProgress.set(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        this.uploadProgress.set(
          Math.round((e.loaded / e.total) * 100),
        );
      }
    };
    reader.onload = () => {
      this._finalizeImageSelection(reader.result as string, file.type);
    };
    reader.onerror = () => {
      this.error.set('Failed to read the selected file.');
      this.uploadProgress.set(null);
    };
    reader.readAsDataURL(file);
  }

  selectTemplate(template: MemeTemplate): void {
    this._resetEditorState(true);
    this.selectedTemplateName.set(template.name);

    // Custom template stored as data URL
    if (template.isCustom) {
      const match = template.url.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        this._finalizeImageSelection(template.url, mimeType);
      }
      return;
    }

    // From cache
    if (this.templateCache.has(template.url)) {
      const cached = this.templateCache.get(template.url)!;
      const dataUrl = `data:${cached.mimeType};base64,${cached.data}`;
      this._finalizeImageSelection(dataUrl, cached.mimeType);
      return;
    }

    if (this.loadingTemplateUrl()) return;

    this.loadingTemplateUrl.set(template.url);
    this.loadingPreviewUrl.set(template.url);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.error.set('Could not create canvas context.');
        this.loadingTemplateUrl.set(null);
        this.loadingPreviewUrl.set(null);
        return;
      }

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);

      try {
        const dataUrl = canvas.toDataURL('image/png');
        const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const data = match[2];
          this.templateCache.set(template.url, { data, mimeType });
          this._finalizeImageSelection(dataUrl, mimeType);
        } else {
          this.error.set('Failed to convert template image.');
        }
      } catch {
        this.error.set(
          'Could not load template due to browser CORS restrictions.',
        );
        this.loadingTemplateUrl.set(null);
        this.loadingPreviewUrl.set(null);
      }
    };

    image.onerror = () => {
      this.error.set(
        'Could not load template. AI captions can still be generated from the name.',
      );
      this.selectedImage.set({
        url: template.url,
        data: '',
        mimeType: '',
      });
      this.loadingTemplateUrl.set(null);
      this.loadingPreviewUrl.set(null);
    };

    image.src = template.url;
  }

  // Layer Management Methods
  selectLayer(index: number): void {
    this.selectedLayerIndex.set(
      this.selectedLayerIndex() === index ? null : index,
    );
  }

  addTextLayer(): void {
    const image = this.imagePreview?.nativeElement;
    const baseFontSize = image
      ? Math.round(Math.max(image.naturalWidth / 20, 24))
      : 48;

    const newLayer: TextLayer = {
      id: this.nextLayerId(),
      text: 'New Text',
      fontSize: baseFontSize,
      fontColor: '#FFFFFF',
      outlineColor: '#000000',
      textBlur: 0,
      top: 50,
    };
    this.nextLayerId.update((id) => id + 1);

    this.layers.update((layers) => [...layers, newLayer]);
    // new index is last element
    this.selectedLayerIndex.set(this.layers().length - 1);
  }

  deleteLayer(indexToDelete: number, event: MouseEvent): void {
    event.stopPropagation();
    const currentIndex = this.selectedLayerIndex();

    this.layers.update((layers) =>
      layers.filter((_, i) => i !== indexToDelete),
    );

    if (currentIndex === null) return;

    if (currentIndex === indexToDelete) {
      this.selectedLayerIndex.set(null);
    } else if (currentIndex > indexToDelete) {
      this.selectedLayerIndex.update((i) =>
        i !== null ? i - 1 : null,
      );
    }
  }

  moveLayer(
    index: number,
    direction: 'up' | 'down',
    event: MouseEvent,
  ): void {
    event.stopPropagation();
    this.layers.update((layers) => {
      const to = direction === 'up' ? index - 1 : index + 1;
      if (to < 0 || to >= layers.length) return layers;

      const newLayers = [...layers];
      [newLayers[index], newLayers[to]] = [
        newLayers[to],
        newLayers[index],
      ];
      this.selectedLayerIndex.set(to);
      return newLayers;
    });
  }

  updateSelectedLayerProperty(
    prop: keyof Omit<TextLayer, 'id'>,
    value: any,
  ): void {
    const index = this.selectedLayerIndex();
    if (index === null) return;

    this.layers.update((layers) => {
      const newLayers = [...layers];
      newLayers[index] = { ...newLayers[index], [prop]: value };
      return newLayers;
    });
  }

  async generateCaptions(): Promise<void> {
    const image = this.selectedImage();
    if (!image && !this.loadingPreviewUrl()) {
      this.error.set('Please select an image first.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.captions.set([]);

    try {
      let genCaptions: string[];

      if (image?.data) {
        genCaptions =
          await this.geminiService.generateMemeCaptions(
            image.data,
            image.mimeType,
            this.selectedTone(),
            this.userContext(),
          );
      } else if (this.selectedTemplateName()) {
        genCaptions =
          await this.geminiService.generateCaptionsFromText(
            this.selectedTemplateName()!,
            this.selectedTone(),
            this.userContext(),
          );
      } else {
        throw new Error(
          'Cannot generate captions without image data or a template name.',
        );
      }

      this.captions.set(genCaptions);
    } catch (e: unknown) {
      this.error.set(
        e instanceof Error
          ? e.message
          : 'An unknown error occurred.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  applyCaption(caption: string): void {
    const parts = caption.split(/ - | \/ | \| /);
    this.layers.update((layers) => {
      if (layers.length === 0) return layers;

      const newLayers = [...layers];
      newLayers[0] = {
        ...newLayers[0],
        text: parts[0].trim(),
      };

      if (layers.length > 1) {
        newLayers[1] = {
          ...newLayers[1],
          text:
            parts.length > 1
              ? parts.slice(1).join(' ').trim()
              : '',
        };
      }
      return newLayers;
    });
  }

  private _generateMemeCanvas(): Promise<HTMLCanvasElement | null> {
    return new Promise((resolve) => {
      const preview = this.imagePreview?.nativeElement;
      if (!preview) {
        this.error.set('Image preview not available.');
        resolve(null);
        return;
      }

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = preview.src;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.error.set('Could not create canvas context.');
          resolve(null);
          return;
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Apply global image filter
        ctx.filter = this.computedImageFilter();
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none'; // Reset filter for text

        // Draw text layers
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const layer of this.layers()) {
          const lineWidth = Math.max(1, Math.round(layer.fontSize / 24));
          ctx.font = `bold ${layer.fontSize}px Impact`;
          ctx.fillStyle = layer.fontColor;
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = lineWidth;
          ctx.filter = this.getLayerTextFilter(layer);

          const y = (layer.top / 100) * canvas.height;
          ctx.strokeText(layer.text, canvas.width / 2, y);
          ctx.fillText(layer.text, canvas.width / 2, y);
        }
        
        ctx.filter = 'none';
        resolve(canvas);
      };

      image.onerror = () => {
        this.error.set('Could not load image for processing due to CORS policy. Try uploading your own image.');
        resolve(null);
      };
    });
  }

  async downloadMeme(): Promise<void> {
    const canvas = await this._generateMemeCanvas();
    if (!canvas) return;

    try {
      const quality = this.downloadQuality();
      const url = canvas.toDataURL('image/jpeg', quality);
      const link = document.createElement('a');
      link.download = 'ai-meme.jpeg';
      link.href = url;
      link.click();
    } catch {
      this.error.set('Could not export image due to browser CORS restrictions. Try uploading your own image.');
    }
  }

  async copyMemeToClipboard(): Promise<void> {
    this.error.set(null);
    const canvas = await this._generateMemeCanvas();
    if (!canvas) return;

    if (!navigator.clipboard?.write) {
      this.error.set('Clipboard API is not available on this browser.');
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        this.error.set('Failed to create image blob.');
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        this.copyButtonText.set('Copied!');
        setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        this.error.set('Failed to copy image to clipboard.');
      }
    }, 'image/png');
  }

  saveState(): void {
    if (!this.isEditing()) return;

    const stateToSave: SavedMemeState = {
      selectedImage: this.selectedImage(),
      layers: this.layers(),
      imageFilter: this.imageFilter(),
      selectedTemplateName: this.selectedTemplateName(),
      userContext: this.userContext(),
      selectedTone: this.selectedTone()
    };

    try {
      localStorage.setItem('savedMemeState', JSON.stringify(stateToSave));
      this.savedStateExists.set(true);
      this.saveButtonText.set('Saved!');
      setTimeout(() => this.saveButtonText.set('Save Work'), 2000);
    } catch (e) {
      this.error.set('Failed to save state to local storage. It might be full.');
      console.error('Error saving state:', e);
    }
  }

  loadState(): void {
    try {
      const savedStateJSON = localStorage.getItem('savedMemeState');
      if (!savedStateJSON) {
        this.error.set('No saved state found.');
        return;
      }

      const savedState: SavedMemeState = JSON.parse(savedStateJSON);

      this._resetEditorState(true); // Keep template name if it exists

      this.selectedImage.set(savedState.selectedImage || null);
      this.layers.set(savedState.layers || []);
      this.imageFilter.set(savedState.imageFilter || 'none');
      this.selectedTemplateName.set(savedState.selectedTemplateName || null);
      this.userContext.set(savedState.userContext || '');
      this.selectedTone.set(savedState.selectedTone || 'humorous');
      
      const maxId = savedState.layers?.reduce((max: number, layer: TextLayer) => Math.max(max, layer.id), 0) || 0;
      this.nextLayerId.set(maxId + 1);

      this.selectedLayerIndex.set(null);
      this.error.set(null); // Clear previous errors

    } catch (e) {
      this.error.set('Failed to load saved state. The data might be corrupted.');
      console.error('Error loading state:', e);
      localStorage.removeItem('savedMemeState'); // Corrupted data, remove it.
      this.savedStateExists.set(false);
    }
  }

  // Other simple state updates
  saveCustomTemplate(): void {
    const name = this.newTemplateName().trim();
    const image = this.selectedImage();

    if (!name || !image?.data) {
      this.error.set(
        'An image must be uploaded to save a template.',
      );
      return;
    }

    if (
      this.templates().some(
        (t) => t.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      this.error.set(
        'A template with this name already exists.',
      );
      return;
    }

    const dataUrl = `data:${image.mimeType};base64,${image.data}`;
    const newTemplate: MemeTemplate = {
      name,
      url: dataUrl,
      isCustom: true,
    };

    this.customTemplates.update((current) => {
      const updated = [...current, newTemplate];
      localStorage.setItem(
        'customMemeTemplates',
        JSON.stringify(updated),
      );
      return updated;
    });

    this.newTemplateName.set('');
    this.showSaveTemplateInput.set(false);
    this.error.set(null);
  }

  deleteCustomTemplate(
    templateToDelete: MemeTemplate,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.customTemplates.update((current) => {
      const updated = current.filter(
        (t) => t.url !== templateToDelete.url,
      );
      localStorage.setItem(
        'customMemeTemplates',
        JSON.stringify(updated),
      );
      return updated;
    });

    if (this.selectedImage()?.url === templateToDelete.url) {
      this.selectedImage.set(null);
      this.layers.set([]);
      this.selectedLayerIndex.set(null);
    }
  }

  applyFilter(filterName: ImageFilter): void {
    this.imageFilter.set(filterName);
  }

  selectTone(tone: CaptionTone): void {
    this.selectedTone.set(tone);
  }
}
