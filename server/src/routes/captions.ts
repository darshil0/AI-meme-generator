import { Router } from 'express';
import { generateCaptionsFromImage, generateCaptionsFromTemplateName } from '../lib/geminiClient';
import { CaptionTone, GeneratedCaptionsResponse } from '../models/api-types';

const router = Router();

router.post('/generate-captions-from-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, tone, context } = req.body ?? {};

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: 'imageBase64 and mimeType are required.' });
    }

    const finalTone = tone ?? CaptionTone.HUMOROUS;
    const captions = await generateCaptionsFromImage(
      imageBase64,
      mimeType,
      finalTone,
      context ?? '',
    );

    const response: GeneratedCaptionsResponse = {
      captions,
      tone: finalTone,
      success: true,
    };
    res.json(response);
  } catch (err: any) {
    console.error('Error in /generate-captions-from-image:', err);
    res.status(500).json({
      success: false,
      error: err?.message ?? 'Failed to generate captions from image.',
    });
  }
});

router.post('/generate-captions-from-text', async (req, res) => {
  try {
    const { templateName, tone, context } = req.body ?? {};
    if (!templateName) {
      return res.status(400).json({ error: 'templateName is required.' });
    }

    const finalTone = tone ?? CaptionTone.HUMOROUS;
    const captions = await generateCaptionsFromTemplateName(templateName, finalTone, context ?? '');

    const response: GeneratedCaptionsResponse = {
      captions,
      tone: finalTone,
      success: true,
    };
    res.json(response);
  } catch (err: any) {
    console.error('Error in /generate-captions-from-text:', err);
    res.status(500).json({
      success: false,
      error: err?.message ?? 'Failed to generate captions from template name.',
    });
  }
});

export default router;
