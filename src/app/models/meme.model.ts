/**
 * @file meme.model.ts
 * Domain interfaces, models, enums, and constants for the AI Meme Generator frontend.
 */

import { CaptionTone, GeneratedCaptionsResponse } from './api-types';

export { CaptionTone };
export type { GeneratedCaptionsResponse };

/**
 * Meme template configuration for both default library templates and custom user uploads.
 */
export interface MemeTemplate {
  /** Display name of the meme template */
  name: string;
  /** Image URL or base64 data URL */
  url: string;
  /** True if the template was created/uploaded by the user */
  isCustom?: boolean;
  /** Optional description used as prompt context for AI caption generation */
  description?: string;
  /** Categorization tag for sorting/filtering templates */
  category?: 'popular' | 'classic' | 'recent' | 'custom';
}

/**
 * Individual text layer configuration rendered on the meme canvas.
 */
export interface TextLayer {
  /** Unique numeric identifier for tracking the layer */
  id: number;
  /** Text content displayed in the layer */
  text: string;
  /** Font size in pixels */
  fontSize: number;
  /** Hex color code for the text fill */
  fontColor: string;
  /** Hex color code for the text outline stroke */
  outlineColor: string;
  /** Text blur/glow effect radius in pixels (0 for none) */
  textBlur: number;
  /** Vertical position as a percentage (0-100) from the top of the canvas */
  top: number;

  /** Optional font weight specification */
  fontWeight?: 'normal' | 'bold' | 'bolder';
  /** Optional text alignment specification */
  textAlign?: 'left' | 'center' | 'right';
  /** Optional maximum width constraint in pixels */
  maxWidth?: number;
  /** Optional layer rotation angle in degrees */
  rotation?: number;
}

/**
 * Supported CSS image filter options for meme canvas rendering.
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

/**
 * Download quality preset option for JPEG export.
 */
export interface DownloadQuality {
  /** Human-readable quality label shown in UI */
  label: string;
  /** JPEG export quality compression value (0.0 to 1.0) */
  value: number;
}

/**
 * Complete persisted meme editor state structure stored in IndexedDB.
 */
export interface SavedMemeState {
  /** Schema version for state migrations */
  version: number;
  /** Selected base image payload or null */
  selectedImage: {
    url: string;
    data: string;
    mimeType: string;
    dimensions?: { width: number; height: number };
  } | null;
  /** Configured text layers */
  layers: TextLayer[];
  /** Applied image filter */
  imageFilter: ImageFilter;
  /** Name of the active selected template */
  selectedTemplateName: string | null;
  /** Custom user context string for AI generation */
  userContext: string;
  /** Selected caption tone */
  selectedTone: CaptionTone;
  /** Download JPEG quality value */
  downloadQuality: number;
  /** Next layer ID counter value */
  nextLayerId: number;
  /** ISO timestamp string when state was saved */
  timestamp: string;
}

/**
 * Application-wide limits and configuration constants.
 */
export const MEME_CONSTANTS = {
  /** Maximum allowed file size for image uploads (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum number of text layers allowed per meme */
  MAX_LAYERS: 10,
  /** Maximum font size in pixels */
  MAX_FONT_SIZE: 200,
  /** Minimum font size in pixels */
  MIN_FONT_SIZE: 12,
  /** Default export JPEG quality ratio */
  DEFAULT_QUALITY: 0.92,
  /** Maximum number of custom user templates allowed */
  MAX_CUSTOM_TEMPLATES: 50,
  /** List of supported image MIME types */
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
 * Filter category options for template library navigation.
 */
export type TemplateCategory = 'all' | 'popular' | 'classic' | 'recent' | 'custom';

/**
 * CSS filter rule mappings for each `ImageFilter` enum value.
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
 * Descriptive human-readable tooltips for caption tone options.
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
