import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

router.get('/template-image', async (req, res) => {
  try {
    const url = req.query.url as string | undefined;
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }

    const allowedHosts = ['i.imgur.com'];
    const parsed = new URL(url);
    if (!allowedHosts.includes(parsed.hostname)) {
      return res.status(400).send('Host not allowed');
    }

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return res.status(502).send('Failed to fetch image');
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    (upstream.body as any).pipe(res);
  } catch (err) {
    console.error('Error in /template-image:', err);
    res.status(500).send('Internal image proxy error');
  }
});

export default router;
