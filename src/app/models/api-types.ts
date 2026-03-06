// api-types.ts - Shared between frontend and backend

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

export interface GeneratedCaptionsResponse {
  captions: string[];
  tone: string;
  success: boolean;
  error?: string;
}

export interface ImageProxyResponse {
  data: string;
  mimeType: string;
}
