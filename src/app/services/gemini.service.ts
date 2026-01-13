import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CaptionTone } from '../models/meme.model';

interface CaptionsResponse {
  captions: string[];
  tone: string;
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  constructor(private http: HttpClient) {}

  // Backend owns the real configuration; assume true if backend is up.
  isConfigured(): boolean {
    return true;
  }

  private sanitizeCaptions(captions: string[]): string[] {
    const tagRegex = /<[^>]*>/g;
    return captions.map(caption => caption.replace(tagRegex, '').trim());
  }

  async generateMemeCaptions(
    base64ImageData: string,
    mimeType: string,
    tone: CaptionTone,
    context: string,
  ): Promise<string[]> {
    const resp = await this.http
      .post<CaptionsResponse>('/api/generate-captions-from-image', {
        imageBase64: base64ImageData,
        mimeType,
        tone,
        context,
      })
      .toPromise();

    if (!resp?.success) {
      throw new Error(resp?.error ?? 'Failed to generate captions.');
    }

    return this.sanitizeCaptions(resp.captions ?? []);
  }

  async generateCaptionsFromText(
    templateName: string,
    tone: CaptionTone,
    context: string,
  ): Promise<string[]> {
    const resp = await this.http
      .post<CaptionsResponse>('/api/generate-captions-from-text', {
        templateName,
        tone,
        context,
      })
      .toPromise();

    if (!resp?.success) {
      throw new Error(resp?.error ?? 'Failed to generate captions.');
    }

    return this.sanitizeCaptions(resp.captions ?? []);
  }
}
