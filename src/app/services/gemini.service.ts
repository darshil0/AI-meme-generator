import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CaptionTone } from '../models/meme.model';

/**
 * Server response payload for caption generation requests.
 */
interface CaptionsResponse {
  captions: string[];
  tone: string;
  success: boolean;
  error?: string;
}

/**
 * Service providing client-side communication with the Express backend proxy
 * for AI caption generation via the Gemini API.
 */
@Injectable({ providedIn: 'root' })
export class GeminiService {
  constructor(private http: HttpClient) {}

  /**
   * Checks with backend server whether GEMINI_API_KEY is configured.
   * @returns Promise resolving to true if backend has a configured API key.
   */
  async checkConfiguration(): Promise<boolean> {
    try {
      const resp = await firstValueFrom(
        this.http.get<{ configured: boolean }>('/api/config-status'),
      );
      return !!resp?.configured;
    } catch (e) {
      console.warn('Failed to check backend configuration:', e);
      return false;
    }
  }

  /**
   * Sanitizes generated caption strings by removing HTML tags.
   * @param captions Raw array of caption strings.
   * @returns Cleaned array of captions.
   */
  private sanitizeCaptions(captions: string[]): string[] {
    const tagRegex = /<[^>]*>/g;
    return captions.map((caption) => caption.replace(tagRegex, '').trim());
  }

  /**
   * Requests AI caption suggestions based on uploaded base64 image data.
   * @param base64ImageData Base64 string of the image.
   * @param mimeType Image MIME type.
   * @param tone Requested caption tone.
   * @param context Additional thematic context string.
   * @returns Promise resolving to an array of generated captions.
   */
  async generateMemeCaptions(
    base64ImageData: string,
    mimeType: string,
    tone: CaptionTone,
    context: string,
  ): Promise<string[]> {
    const resp = await firstValueFrom(
      this.http.post<CaptionsResponse>('/api/generate-captions-from-image', {
        imageBase64: base64ImageData,
        mimeType,
        tone,
        context,
      }),
    );

    if (!resp?.success) {
      throw new Error(resp?.error ?? 'Failed to generate captions.');
    }

    return this.sanitizeCaptions(resp.captions ?? []);
  }

  /**
   * Requests AI caption suggestions based on a meme template name.
   * @param templateName Name of the meme template.
   * @param tone Requested caption tone.
   * @param context Additional thematic context string.
   * @returns Promise resolving to an array of generated captions.
   */
  async generateCaptionsFromText(
    templateName: string,
    tone: CaptionTone,
    context: string,
  ): Promise<string[]> {
    const resp = await firstValueFrom(
      this.http.post<CaptionsResponse>('/api/generate-captions-from-text', {
        templateName,
        tone,
        context,
      }),
    );

    if (!resp?.success) {
      throw new Error(resp?.error ?? 'Failed to generate captions.');
    }

    return this.sanitizeCaptions(resp.captions ?? []);
  }
}
