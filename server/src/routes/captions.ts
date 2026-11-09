import { Router } from 'express';
import {
  generateCaptionsFromImage,
  generateCaptionsFromTemplateName,
} from '../lib/geminiClient.js';
import { CaptionTone, GeneratedCaptionsResponse } from '../models/api-types.js';

const router = Router();
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_CONTEXT_LENGTH = 500;
const MAX_TEMPLATE_NAME_LENGTH = 100;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']);
const VALID_TONES = new Set<string>(Object.values(CaptionTone));

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isValidTone(tone: unknown): tone is CaptionTone {
  return tone === undefined || (isString(tone) && VALID_TONES.has(tone));
}

function isValidContext(context: unknown): context is string | undefined {
  return context === undefined || (isString(context) && context.length <= MAX_CONTEXT_LENGTH);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown caption generation error';
}

/** POST /api/generate-captions-from-image */
router.post('/generate-captions-from-image', async (req, res) => {
  const { imageBase64, mimeType, tone, context } = req.body ?? {};
  if (!isString(imageBase64) || !isString(mimeType)) {
    return res.status(400).json({ success: false, error: 'imageBase64 and mimeType must be strings.' });
  }
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return res.status(400).json({ success: false, error: 'Unsupported image MIME type.' });
  }
  if (!isValidTone(tone) || !isValidContext(context)) {
    return res.status(400).json({ success: false, error: 'Invalid tone or context.' });
  }

  const normalizedBase64 = imageBase64.replace(/^data:[^,]*;base64,/, '');
  if (
    !normalizedBase64 ||
    normalizedBase64.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 4 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedBase64) ||
    normalizedBase64.length % 4 === 1
  ) {
    return res.status(400).json({ success: false, error: 'Invalid or oversized base64 image.' });
  }

  const imageSize = Buffer.from(normalizedBase64, 'base64').length;
  if (imageSize > MAX_IMAGE_BYTES) {
    return res.status(413).json({ success: false, error: 'Image exceeds the maximum allowed size.' });
  }

  try {
    const finalTone = tone ?? CaptionTone.HUMOROUS;
    const captions = await generateCaptionsFromImage(
      normalizedBase64,
      mimeType,
      finalTone,
      context ?? '',
    );
    const response: GeneratedCaptionsResponse = { captions, tone: finalTone, success: true };
    return res.json(response);
  } catch (error) {
    console.error('[Captions Route] Image generation failed:', error);
    return res.status(500).json({ success: false, error: 'Caption generation failed.' });
  }
});

/** POST /api/generate-captions-from-text */
router.post('/generate-captions-from-text', async (req, res) => {
  const { templateName, tone, context } = req.body ?? {};
  if (
    !isString(templateName) ||
    !templateName.trim() ||
    templateName.length > MAX_TEMPLATE_NAME_LENGTH
  ) {
    return res.status(400).json({ success: false, error: 'A templateName of 1–100 characters is required.' });
  }
  if (!isValidTone(tone) || !isValidContext(context)) {
    return res.status(400).json({ success: false, error: 'Invalid tone or context.' });
  }

  try {
    const finalTone = tone ?? CaptionTone.HUMOROUS;
    const captions = await generateCaptionsFromTemplateName(
      templateName.trim(),
      finalTone,
      context ?? '',
    );
    const response: GeneratedCaptionsResponse = { captions, tone: finalTone, success: true };
    return res.json(response);
  } catch (error) {
    console.error('[Captions Route] Text generation failed:', errorMessage(error));
    return res.status(500).json({ success: false, error: 'Caption generation failed.' });
  }
});

export default router;
