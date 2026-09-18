import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

/**
 * GET /api/template-image?url=https://...
 * CORS-safe image proxy route endpoint that fetches and streams external meme template images
 * to avoid client cross-origin issues during canvas manipulation.
 */
router.get('/template-image', async (req, res) => {
  try {
    const url = req.query.url as string | undefined;
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }

    const defaultAllowedHosts = [
      'i.imgur.com',
      'imgflip.com',
      'i.imgflip.com',
      'memegen.link',
      'i.redd.it',
      'giphy.com',
      'media.giphy.com',
      'unsplash.com',
      'images.unsplash.com',
    ];
    const envHosts = process.env.ALLOWED_HOSTS
      ? process.env.ALLOWED_HOSTS.split(',')
          .map((h) => h.trim())
          .filter(Boolean)
      : [];
    const allowedHosts = new Set([...defaultAllowedHosts, ...envHosts]);

    const parsed = new URL(url);
    if (!allowedHosts.has(parsed.hostname)) {
      return res.status(400).send('Host not allowed');
    }

    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(502).send('Failed to fetch image from upstream');
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('URL did not resolve to a valid image');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    type StreamWithPipe = { pipe: (destination: unknown) => void };
    if (upstream.body && typeof (upstream.body as unknown as StreamWithPipe).pipe === 'function') {
      (upstream.body as unknown as StreamWithPipe).pipe(res);
    } else if (upstream.body) {
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.send(buffer);
    } else {
      res.status(502).send('Upstream body unavailable');
    }
  } catch (err) {
    console.error('Error in /template-image:', err);
    res.status(500).send('Internal image proxy error');
  }
});

export default router;
