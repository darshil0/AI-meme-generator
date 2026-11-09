# AI Meme Generator 🤖

Create and edit memes with an Angular app and AI-generated captions. Upload an image or choose a built-in template, customize text and filters, then download the result or copy it to your clipboard.

![Angular 21.2](https://img.shields.io/badge/Angular-21.2-red?style=flat-square&logo=angular)
![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)
![Gemini API](https://img.shields.io/badge/Gemini-gemini--2.0--flash-blue?style=flat-square)

## Features

- Upload JPG, PNG, GIF, WebP, BMP, and SVG images up to 10 MB, or select from 13 built-in meme templates.
- Save up to 50 custom templates in browser IndexedDB.
- Generate captions from an image or template name using Google's Gemini API. The editor offers seven tone choices: humorous, sarcastic, wholesome, absurd, dark, professional, and poetic. The backend API also recognizes dramatic, inspirational, and snarky tones.
- Edit up to 10 text layers, including text, size, fill, outline, blur, vertical position, alignment, rotation, width, and font weight.
- Apply seven filters in the editor: grayscale, sepia, invert, blur, brightness, and contrast, plus the no-filter option. The model also defines saturate, hue-rotate, and opacity filters, but they are not currently exposed in the editor's filter list.
- Switch between dark and light themes; save and resume editor state using IndexedDB.
- Download a JPEG with selectable quality or copy a PNG to the clipboard.

### Caption image limits

The browser accepts image uploads up to 10 MB, but the caption API accepts raster images up to 8 MiB. SVG files can be edited/exported in the browser, but the caption API does not accept SVG. To generate captions from an uploaded image, use JPEG, PNG, GIF, WebP, or BMP within the API limit. Built-in templates can still generate captions by template name when image loading fails.

## Technology

- Angular 21.2 with zoneless change detection and Signals
- TypeScript 5.9, Tailwind CSS 3.4
- Express backend and Google GenAI SDK (`gemini-2.0-flash`)
- IndexedDB through `idb-keyval`
- Vitest and Playwright

## Requirements

- Node.js 20.19 or newer (required by the Angular 21 toolchain)
- npm 9 or newer
- A Google Gemini API key for caption generation
- Playwright Chromium browser installed (`npx playwright install chromium`)

## Local setup

Clone and install dependencies:

```bash
git clone https://github.com/darshil0/AI-meme-generator.git
cd AI-meme-generator
npm install
cd server && npm install && cd ..
npx playwright install chromium
```

The backend reads configuration from its process environment. The repository does not load `server/.env` automatically, so setting values in that file alone will not configure the server. Export the variables in the backend shell (or configure them in your process manager):

```bash
cd server
export GEMINI_API_KEY='your_gemini_api_key'
export ALLOWED_ORIGIN='http://localhost:4200'
export PORT=4000
# Optional: add comma-separated exact hostnames to the proxy allowlist.
export ALLOWED_HOSTS='images.example.com'
npm run dev
```

In another terminal, from the repository root:

```bash
npm run dev
```

The frontend is served at `http://localhost:4200`; the backend listens on port 4000 by default. `ALLOWED_HOSTS` adds exact hostnames to the built-in allowlist; it does not replace the built-in hosts.

## Commands

From the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Angular with the `/api` development proxy |
| `npm run build` | Build the frontend for production |
| `npm test` | Run frontend Vitest tests |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run the Playwright browser tests in `e2e/meme-editor.spec.ts` |

From `server/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the backend with `tsx` watch mode |
| `npm run build` | Compile the backend TypeScript |
| `npm test` | Run backend Vitest tests |
| `npm run lint` | Lint backend source |

### End-to-end test coverage

The Playwright suite at [`e2e/meme-editor.spec.ts`](e2e/meme-editor.spec.ts) covers:

1. Landing page and template picker render.
2. Image upload, adding a text layer, editing its text, and applying a filter.
3. Caption generation for an uploaded image and applying a generated suggestion.
4. Saving and restoring edited work.
5. Caption generation by template name when a selected template image cannot be loaded.

The tests mock caption/configuration API responses and do not require a live Gemini API key. `playwright.config.ts` starts the frontend and backend servers automatically. Run `npm run test:e2e` from the repository root.

## Production build

Build the Angular frontend with `npm run build`; Angular's configured output path is `dist/app/browser`. Build the backend separately:

```bash
cd server
npm run build
npm start
```

Set `GEMINI_API_KEY`, `ALLOWED_ORIGIN`, `ALLOWED_HOSTS` (if needed), and `PORT` in the backend runtime environment. Keep the Gemini key on the server; do not put it in frontend environment files or commit it.

## Backend API

- `GET /api/health` — returns `{"status":"ok"}`.
- `GET /api/config-status` — reports whether the backend has a Gemini key configured.
- `POST /api/generate-captions-from-image` — accepts `imageBase64`, `mimeType`, optional `tone`, and optional `context`. Supported MIME types are JPEG, PNG, GIF, WebP, and BMP; decoded image size is limited to 8 MiB; context is limited to 500 characters.
- `POST /api/generate-captions-from-text` — accepts `templateName` (1–100 characters), optional `tone`, and optional `context` (up to 500 characters).
- `GET /api/template-image?url=...` — proxies supported raster images from HTTPS URLs whose hostname is allowed. Redirects are rejected; requests time out after 10 seconds and responses are limited to 10 MiB.

The backend uses the `cors` middleware. `ALLOWED_ORIGIN` controls the CORS response header; it is not an authentication mechanism and does not reject unauthorized callers. The image proxy's host allowlist is likewise not user authentication.

## Documentation and license

See [`docs/DEV_GUIDE.md`](docs/DEV_GUIDE.md), [`docs/GEMINI.md`](docs/GEMINI.md), and [`docs/CODE_AUDIT.md`](docs/CODE_AUDIT.md) for developer setup, Gemini configuration, and audit details. This project is licensed under the MIT License; see [`LICENSE`](LICENSE).
