import { describe, it, expect, vi, beforeAll } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: JSON.stringify(['Caption 1', 'Caption 2', 'Caption 3', 'Caption 4', 'Caption 5']),
});

// Mock @google/genai
vi.mock('@google/genai', () => {
  class GoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  }
  return {
    GoogleGenAI,
    Type: {
      ARRAY: 'ARRAY',
      STRING: 'STRING',
    },
  };
});

import {
  isGeminiConfigured,
  generateCaptionsFromImage,
  generateCaptionsFromTemplateName,
  initializeGemini,
} from './geminiClient';

describe('geminiClient', () => {
  beforeAll(() => {
    initializeGemini('fake-api-key');
  });

  it('should return true for isGeminiConfigured when API key is set', () => {
    expect(isGeminiConfigured()).toBe(true);
  });

  it('should generate captions from image', async () => {
    const captions = await generateCaptionsFromImage(
      'base64data',
      'image/png',
      'humorous',
      'test context',
    );
    expect(captions).toHaveLength(5);
    expect(captions[0]).toBe('Caption 1');
  });

  it('should generate captions from template name', async () => {
    const captions = await generateCaptionsFromTemplateName('Doge', 'sarcastic', 'test context');
    expect(captions).toHaveLength(5);
    expect(captions[0]).toBe('Caption 1');
  });
});
