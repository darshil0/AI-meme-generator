/**
 * @file api-types.ts
 * Shared API interfaces and enums for backend Express routes and handlers.
 */

/**
 * Available caption tone choices for Gemini AI meme generation.
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
 * Response payload format for proxied template image calls.
 */
export interface ImageProxyResponse {
  /** Base64 encoded image payload string */
  data: string;
  /** MIME type of the proxied image */
  mimeType: string;
}
