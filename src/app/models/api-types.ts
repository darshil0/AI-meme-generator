/**
 * @file api-types.ts
 * Shared API models and interfaces between frontend and backend.
 */

/**
 * Available tone options for AI meme caption generation.
 */
export enum CaptionTone {
  HUMOROUS = 'humorous',
  SARCASTIC = 'sarcastic',
  WHOLESOME = 'wholesome',
  ABSURD = 'absurd',
  DARK = 'dark',
  PROFESSIONAL = 'professional',
  POETIC = 'poetic',
  DRAMATIC = 'dramatic',
  INSPIRATIONAL = 'inspirational',
  SNARKY = 'snarky',
}

/**
 * Standard API response payload returned by caption generation endpoints.
 */
export interface GeneratedCaptionsResponse {
  /** Generated array of caption strings */
  captions: string[];
  /** Caption tone requested */
  tone: string;
  /** Whether the request succeeded */
  success: boolean;
  /** Error message if request failed */
  error?: string;
}

/**
 * Standard response for template image proxy calls.
 */
export interface ImageProxyResponse {
  /** Base64 encoded image string */
  data: string;
  /** MIME type of the proxied image */
  mimeType: string;
}
