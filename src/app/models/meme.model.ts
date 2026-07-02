// meme.model.ts

/**
 * Meme template configuration for both default and custom templates.
 */
export interface MemeTemplate {
  name: string;
  url: string;
  isCustom?: boolean;
  description?: string; // Optional description for AI caption generation
  category?: 'popular' | 'classic' | 'recent' | 'custom'; // Template categorization
}

/**
 * Individual text layer configuration for meme rendering.
 */
export interface TextLayer {
  id: number;
  text: string;
  fontSize: number;
  fontColor: string;
  outlineColor: string;
  textBlur: number;
  top: number; // Position as percentage (0-100) from top edge

  // Additional styling options
  fontWeight?: 'normal' | 'bold' | 'bolder';
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number; // Optional max width constraint in pixels
  rotation?: number; // Optional rotation in degrees
}

/**
 * Image filter options for canvas manipulation.
 */
export enum ImageFilter {
  NONE = 'none',
  GRAYSCALE = 'grayscale',
  SEPIA = 'sepia',
  INVERT = 'invert',
  BLUR = 'blur',
  BRIGHTNESS = 'brightness',
  CONTRAST = 'contrast',
  SATURATE = 'saturate',
  HUE_ROTATE = 'hue-rotate',
  OPACITY = 'opacity',
}

import { CaptionTone } from './api-types';
export { CaptionTone };

/**
 * Download quality presets.
 */
export interface DownloadQuality {
  label: string;
  value: number; // 0.0 to 1.0
}

/**
 * Complete saved meme state for persistence.
 */
export interface SavedMemeState {
  version: number; // Schema version for future migrations
  selectedImage: {
    url: string;
    data: string;
    mimeType: string;
    dimensions?: { width: number; height: number };
  } | null;
  layers: TextLayer[];
  imageFilter: ImageFilter;
  selectedTemplateName: string | null;
  userContext: string;
  selectedTone: CaptionTone;
  downloadQuality: number;
  nextLayerId: number;
  timestamp: string; // ISO timestamp
}

import { GeneratedCaptionsResponse } from './api-types';
export type { GeneratedCaptionsResponse };

/**
 * Validation utilities.
 */
export const MEME_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LAYERS: 10,
  MAX_FONT_SIZE: 200,
  MIN_FONT_SIZE: 12,
  DEFAULT_QUALITY: 0.92,
  MAX_CUSTOM_TEMPLATES: 50,
  SUPPORTED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
  ] as const,
} as const;

/**
 * Utility type for template filtering.
 */
export type TemplateCategory = 'all' | 'popular' | 'classic' | 'recent' | 'custom';

/**
 * Computed filter mapping for CSS.
 */
export const IMAGE_FILTER_CSS_MAP: Record<ImageFilter, string> = {
  [ImageFilter.NONE]: 'none',
  [ImageFilter.GRAYSCALE]: 'grayscale(100%)',
  [ImageFilter.SEPIA]: 'sepia(85%) contrast(120%) saturate(200%)',
  [ImageFilter.INVERT]: 'invert(100%)',
  [ImageFilter.BLUR]: 'blur(3px)',
  [ImageFilter.BRIGHTNESS]: 'brightness(150%)',
  [ImageFilter.CONTRAST]: 'contrast(150%)',
  [ImageFilter.SATURATE]: 'saturate(200%)',
  [ImageFilter.HUE_ROTATE]: 'hue-rotate(90deg)',
  [ImageFilter.OPACITY]: 'opacity(75%)',
};

/**
 * Tone descriptions for UI tooltips.
 */
export const CAPTION_TONE_DESCRIPTIONS: Record<CaptionTone, string> = {
  [CaptionTone.HUMOROUS]: 'Funny and lighthearted',
  [CaptionTone.SARCASTIC]: 'Witty with irony',
  [CaptionTone.WHOLESOME]: 'Positive and heartwarming',
  [CaptionTone.ABSURD]: 'Completely ridiculous',
  [CaptionTone.DARK]: 'Dark humor and edgy',
  [CaptionTone.PROFESSIONAL]: 'Clean and workplace-safe',
  [CaptionTone.POETIC]: 'Artistic and metaphorical',
  [CaptionTone.DRAMATIC]: 'Over-the-top intensity',
  [CaptionTone.INSPIRATIONAL]: 'Motivational and uplifting',
  [CaptionTone.SNARKY]: 'Sharp and biting wit',
};
