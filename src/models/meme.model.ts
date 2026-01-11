export interface MemeTemplate {
  name: string;
  url: string;
  isCustom?: boolean;
}

export interface TextLayer {
  id: number;
  text: string;
  fontSize: number;
  fontColor: string;
  outlineColor: string;
  textBlur: number;
  top: number; // Position in % from the top edge
}

export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'invert';

export type CaptionTone = 'humorous' | 'sarcastic' | 'wholesome' | 'absurd' | 'dark';
