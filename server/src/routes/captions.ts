import { Router } from 'express';
import {
  generateCaptionsFromImage,
  generateCaptionsFromTemplateName,
} from '../lib/geminiClient.js';
import { ClientError } from '../lib/errors.js';
import { handleRequest } from '../lib/requestHandler.js';

const router = Router();

router.post(
  '/generate-captions-from-image',
  handleRequest(async (req) => {
    const { imageBase64, mimeType, tone, context } = req.body ?? {};
    if (!imageBase64 || !mimeType) {
      throw new ClientError('`imageBase64` and `mimeType` are required.');
    }

    const captions = await generateCaptionsFromImage(
      imageBase64,
      mimeType,
      tone ?? 'humorous',
      context ?? '',
    );

    return { captions, tone: tone ?? 'humorous', success: true };
  }),
);

router.post(
  '/generate-captions-from-text',
  handleRequest(async (req) => {
    const { templateName, tone, context } = req.body ?? {};
    if (!templateName) {
      throw new ClientError('`templateName` is required.');
    }

    const captions = await generateCaptionsFromTemplateName(
      templateName,
      tone ?? 'humorous',
      context ?? '',
    );

    return { captions, tone: tone ?? 'humorous', success: true };
  }),
);

export default router;
