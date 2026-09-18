import express from 'express';
import cors from 'cors';
import captionsRouter from './routes/captions.js';
import imagesRouter from './routes/images.js';
import { isGeminiConfigured } from './lib/geminiClient.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/error.js';

/**
 * Main Express backend proxy server entry point for the AI Meme Generator.
 * Serves CORS header management, request logging, caption generation,
 * image proxying, health checks, and global error handling.
 */
const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(logger);

app.use('/api', captionsRouter);
app.use('/api', imagesRouter);

/** GET /api/health - Health check endpoint */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/** GET /api/config-status - Backend Gemini API key configuration check endpoint */
app.get('/api/config-status', (_req, res) => {
  res.json({ configured: isGeminiConfigured() });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
