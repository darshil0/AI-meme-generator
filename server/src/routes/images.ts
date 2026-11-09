import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']);
const DEFAULT_ALLOWED_HOSTS = [
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

function getAllowedHosts(): Set<string> {
  const configuredHosts = (process.env.ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_HOSTS, ...configuredHosts]);
}

/**
 * GET /api/template-image?url=https://...
 * Proxies approved raster images while limiting destinations, response size, and request time.
 */
router.get('/template-image', async (req, res) => {
  const rawUrl = req.query.url;
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return res.status(400).send('A single url parameter is required');
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).send('Invalid image URL');
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    (parsed.port && parsed.port !== '443') ||
    !getAllowedHosts().has(parsed.hostname.toLowerCase())
  ) {
    return res.status(400).send('Image URL host or protocol is not allowed');
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    // Do not follow redirects: the redirect target would bypass our host allowlist.
    if (upstream.status >= 300 && upstream.status < 400) {
      return res.status(502).send('Image redirects are not supported');
    }
    if (!upstream.ok) {
      return res.status(502).send('Failed to fetch image from upstream');
    }

    const contentType = upstream.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
      upstream.body?.destroy();
      return res.status(415).send('URL did not resolve to a supported raster image');
    }

    const contentLength = Number(upstream.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      upstream.body?.destroy();
      return res.status(413).send('Image exceeds the maximum allowed size');
    }

    if (!upstream.body) {
      return res.status(502).send('Upstream image body unavailable');
    }

    const chunks: Buffer[] = [];
    let totalBytes = 0;
    for await (const chunk of upstream.body) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;
      if (totalBytes > MAX_IMAGE_BYTES) {
        upstream.body.destroy();
        return res.status(413).send('Image exceeds the maximum allowed size');
      }
      chunks.push(buffer);
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', totalBytes);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.concat(chunks, totalBytes));
  } catch (error) {
    console.error('Error in /template-image:', error);
    if (!res.headersSent) {
      return res.status(502).send('Unable to fetch image from upstream');
    }
  }
});

export default router;
