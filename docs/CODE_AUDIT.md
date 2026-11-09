# Code audit fixes and verification status

This note records the fixes made during the code review and what was checked afterward.

## Template image proxy

The backend image proxy accepts only HTTPS URLs on the configured exact-host allowlist, rejects credentials and nonstandard ports, and does not follow redirects. This prevents a permitted host from redirecting requests to an untrusted destination. It accepts common raster image formats only (SVG is intentionally excluded), aborts upstream requests after 10 seconds, and caps returned image data at 10 MiB. Custom `ALLOWED_HOSTS` entries should be bare hostnames, separated by commas.

## Caption API input limits

Caption routes validate input types, supported MIME types and tone values before calling Gemini. Image requests are limited to 8 MiB of decoded data; context is limited to 500 characters and template names to 100 characters. Invalid or oversized requests return a 4xx response. Gemini failures are logged on the server while API responses use a generic message, avoiding exposure of upstream internals.

## Canvas export

Canvas rendering honors text alignment, optional font weight, rotation, and maximum width from `TextLayer`. Invalid canvas contexts and unloaded images fail cleanly rather than causing an exception.

## Editor state and controls

- The editor exposes a public reset action for Angular template bindings while keeping its reset implementation private.
- Loading a saved meme selects the first layer when present, allowing immediate editing.
- Custom template names are checked against the full stock and custom template collections, independently of the current search filter.
- Layer controls accept the parent's `selectedLayerIndex` binding and resolve the selected layer from that index, so style controls stay connected without requiring a second template binding.
- Filter controls support the parent's `currentFilter` and `selectFilter` bindings, and provide the available filter options by default.

## Verification status

Source inspection confirms that the names used in the editor template now match Angular input/output aliases on the layer and filter controls. Automated tests and Angular/backend builds were not executed in this session. Run `npm test`, `npm run build`, and, from `server/`, `npm test` and `npm run build` before merging. Proxy tests should cover malformed URLs, disallowed hosts, redirects, unsupported MIME types, timeouts, and bodies above the configured limit.
