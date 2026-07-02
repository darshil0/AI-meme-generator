import { Router } from 'express';
import { generateCaptionsFromImage, generateCaptionsFromTemplateName } from '../lib/geminiClient';
import { CaptionTone, GeneratedCaptionsResponse } from '../models/api-types';

const router = Router();

router.post('/generate-captions-from-image', async (req, res) => {
  const { imageBase64, mimeType, tone, context } = req.body ?? {};
  try {
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
  } catch (err) {
    const error = err as Error;
    const errorMessage = error?.message || 'Unknown error during image caption generation';
    console.error(`[Captions Route] API Error (Image): ${errorMessage}`, {
      stack: error?.stack,
      body: { mimeType, tone, contextLength: context?.length },
    });

    res.status(500).json({
      success: false,
      error: `Gemini API Error: ${errorMessage}`,
    });
  }
});

router.post('/generate-captions-from-text', async (req, res) => {
  const { templateName, tone, context } = req.body ?? {};
  try {
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
  } catch (err) {
    const error = err as Error;
    const errorMessage = error?.message || 'Unknown error during text caption generation';
    console.error(`[Captions Route] API Error (Text): ${errorMessage}`, {
      stack: error?.stack,
      body: { templateName, tone, contextLength: context?.length },
    });

    res.status(500).json({
      success: false,
      error: `Gemini API Error: ${errorMessage}`,
    });
  }
});

export default router;
