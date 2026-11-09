# Code audit fixes

This note describes validation and rendering guarantees added after the initial code review.

## Template image proxy

The backend image proxy accepts only HTTPS URLs on the configured exact-host allowlist, rejects credentials and nonstandard ports, and does not follow redirects. This prevents a permitted host from redirecting requests to an untrusted destination. It accepts common raster image formats only (SVG is intentionally excluded), aborts upstream requests after 10 seconds, and caps returned image data at 10 MiB. Custom `ALLOWED_HOSTS` entries should be bare hostnames, separated by commas.

## Caption API input limits

Caption routes validate input types, supported MIME types and tone values before calling Gemini. Image requests are limited to 8 MiB of decoded data; context is limited to 500 characters and template names to 100 characters. Invalid or oversized requests return a 4xx response. Gemini failures are logged on the server while API responses use a generic message, avoiding exposure of upstream internals.

## Canvas export

Canvas rendering now honors text alignment, optional font weight, rotation, and maximum width from `TextLayer`. Invalid canvas contexts and unloaded images fail cleanly rather than causing an exception.

## Verification

Run `npm test`, `npm run build`, and, from `server/`, `npm test` and `npm run build` after changes. Proxy checks should include malformed URLs, disallowed hosts, redirects, unsupported MIME types, timeouts, and bodies above the configured limit.
