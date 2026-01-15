import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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

  /**
   * Checks if the backend is reachable and configured.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const resp = await firstValueFrom(this.http.get<{ status: string }>('/api/health'));
      return resp?.status === 'ok';
    } catch {
      return false;
    }
  }

  isConfigured(): boolean {
    return true; // Config check is now handled by checkHealth() at runtime
  }

  private sanitizeCaptions(captions: string[]): string[] {
    const tagRegex = /<[^>]*>/g;
    return captions.map((caption) => caption.replace(tagRegex, '').trim());
  }

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
