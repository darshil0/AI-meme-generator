import express from 'express';
import cors from 'cors';
import captionsRouter from './routes/captions';
import imagesRouter from './routes/images';
import { isGeminiConfigured } from './lib/geminiClient';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api', captionsRouter);
app.use('/api', imagesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/config-status', (_req, res) => {
  res.json({ configured: isGeminiConfigured() });
});

app.listen(port, () => {
  console.log(Backend listening on port );
});
