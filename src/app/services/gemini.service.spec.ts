import { describe, it, expect, vi } from 'vitest';
import { GeminiService } from './gemini.service';
import { of } from 'rxjs';
import { CaptionTone } from '../models/meme.model';
import { HttpClient } from '@angular/common/http';

describe('GeminiService', () => {
  it('should generate captions from image', async () => {
    const mockHttp = {
      post: vi.fn().mockReturnValue(
        of({
          success: true,
          captions: ['Caption 1', 'Caption 2'],
        }),
      ),
    } as unknown as HttpClient;

    const service = new GeminiService(mockHttp);
    const captions = await service.generateMemeCaptions(
      'base64',
      'image/png',
      CaptionTone.HUMOROUS,
      'context',
    );

    expect(captions).toHaveLength(2);
    expect(captions[0]).toBe('Caption 1');
    expect(mockHttp.post).toHaveBeenCalledWith(
      '/api/generate-captions-from-image',
      expect.any(Object),
    );
  });

  it('should handle error from backend', async () => {
    const mockHttp = {
      post: vi.fn().mockReturnValue(
        of({
          success: false,
          error: 'Backend error',
        }),
      ),
    } as unknown as HttpClient;

    const service = new GeminiService(mockHttp);
    await expect(
      service.generateMemeCaptions('base64', 'image/png', CaptionTone.HUMOROUS, 'context'),
    ).rejects.toThrow('Backend error');
  });
});
