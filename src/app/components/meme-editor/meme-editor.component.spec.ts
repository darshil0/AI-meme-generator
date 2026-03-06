import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemeEditorComponent } from './meme-editor.component';
import { CaptionTone, ImageFilter } from '../../models/meme.model';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// Mock GeminiService
const mockGeminiService = {
  checkConfiguration: vi.fn().mockResolvedValue(true),
  generateMemeCaptions: vi.fn(),
  generateCaptionsFromText: vi.fn(),
};

// Mock inject
vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    inject: vi.fn().mockImplementation((token) => {
      if (token && typeof token === 'function' && token.name === 'GeminiService')
        return mockGeminiService;
      return null;
    }),
  };
});

describe('MemeEditorComponent', () => {
  let component: MemeEditorComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Manual instantiation for logic testing
    component = new MemeEditorComponent();
  });

  it('should initialize with default values', () => {
    expect(component.isEditing()).toBe(false);
    expect(component.selectedTone()).toBe(CaptionTone.HUMOROUS);
    expect(component.imageFilter()).toBe(ImageFilter.NONE);
    expect(component.layers()).toHaveLength(0);
  });

  it('should add a text layer', () => {
    component.addTextLayer();
    expect(component.layers()).toHaveLength(1);
    expect(component.layers()[0].text).toBe('New Text Layer');
    expect(component.selectedLayerIndex()).toBe(0);
  });

  it('should delete a text layer', () => {
    component.addTextLayer();
    component.addTextLayer();
    expect(component.layers()).toHaveLength(2);

    component.deleteLayer(0);
    expect(component.layers()).toHaveLength(1);
    expect(component.selectedLayerIndex()).toBe(0);
  });

  it('should update layer properties', () => {
    component.addTextLayer();
    component.updateSelectedLayerProperty('text', 'Updated Text');
    expect(component.layers()[0].text).toBe('Updated Text');
  });

  it('should apply image filters', () => {
    component.applyFilter(ImageFilter.GRAYSCALE);
    expect(component.imageFilter()).toBe(ImageFilter.GRAYSCALE);
    expect(component.computedImageFilter()).toBe('grayscale(100%)');
  });

  it('should select a tone', () => {
    component.selectTone(CaptionTone.SARCASTIC);
    expect(component.selectedTone()).toBe(CaptionTone.SARCASTIC);
  });
});
