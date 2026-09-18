# AI Meme Generator 🤖

**Your personal AI-powered meme factory. Create viral-worthy memes in seconds with generative AI.**

This web application generates memes by combining images with AI-generated captions. Upload a picture or choose from a library of templates to generate context-aware captions via the Gemini API.

![AI Meme Generator](https://img.shields.io/badge/Version-1.11.0-blueviolet?style=flat-square)
![Angular](https://img.shields.io/badge/Angular-21.2-red?style=flat-square&logo=angular)
![Gemini AI](https://img.shields.io/badge/Gemini_API-v1.52-blue?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)

---

## ✨ Features

### 🖼️ Image Management

- Upload custom image files (JPG, PNG, GIF, WebP, BMP, SVG) up to 10MB with client-side validation.
- Select from 13+ popular meme templates with real-time text filtering.
- Save uploaded images as custom, reusable templates (up to 50 custom templates).
- IndexedDB image and state caching for offline/fast access via `idb-keyval`.

### 🧠 AI Captions

- Generate contextual captions per request using Google's `gemini-2.0-flash` model via `@google/genai`.
- Analyzes base64 image data or template titles for contextual caption positioning.
- 10 selectable tone presets: Humorous, Sarcastic, Wholesome, Absurd, Dark, Professional, Poetic, Dramatic, Inspirational, Snarky.
- Custom context prompt support with fallback mechanics for rate limits and structural errors.

### ✏️ Text & Filter Editor

- Unlimited canvas text layers with drag-and-drop or position ordering.
- Custom controls: font size (10–200px), font color (fill), outline color, text blur/glow (0–10px), vertical placement (0–100%).
- Image filter adjustments: Grayscale, Sepia, Invert, Blur, Brightness, Contrast, Saturate, Hue Rotate, Opacity.
- Premium typography using Anton and Impact meme font fallbacks.

### 🌙 Dark Mode & State Management

- Seamless dark/light mode toggle with Angular Signals and persistent theme state stored in IndexedDB.
- Save and load active editor work sessions on-demand.
- Backward-compatible migration from legacy LocalStorage data models.

### 💾 Storage & Export

- Save and load work via browser IndexedDB (`idb-keyval`).
- Export as JPEG with selectable quality presets (50%, 75%, 92%, 95%).
- One-click copy-to-clipboard functionality.

---

## 🛠️ Tech Stack

- **Frontend:** Angular 21 (Zoneless Signals architecture)
- **AI Integration:** Google Gemini API (`gemini-2.0-flash`) via `@google/genai`
- **Styling:** Tailwind CSS 3.4
- **Language:** TypeScript 5.9+
- **Backend:** Express.js / Node.js 18.13+ (using `tsx` native ESM execution)
- **Storage:** IndexedDB via `idb-keyval`
- **Testing:** Vitest (Unit testing) & Playwright (E2E / SIT testing)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v18.13.0 or higher
- **npm:** v9.0.0 or higher
- **Gemini API Key:** Obtained from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. Clone repository:

```bash
git clone <repository-url>
cd ai-meme-generator
```

2. Install root and server dependencies:

```bash
npm install --legacy-peer-deps
cd server && npm install && cd ..
```

3. Configure Environment Variables:
   Create `.env` inside `server/`:

```env
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGIN=http://localhost:4200
ALLOWED_HOSTS=custom.domain.com,another.domain.com
NODE_ENV=development
PORT=4000
```

---

## 🏃 Running the Application

### 1. Start Backend Proxy

```bash
cd server
npm run dev
```

Backend runs at `http://localhost:4000`.

### 2. Start Frontend App

In a second terminal, from the root folder:

```bash
npm run dev
```

Frontend runs at `http://localhost:4200`.

### 3. Testing & Verification

```bash
npm run test          # Run Vitest unit tests
npm run test:e2e      # Run Playwright E2E tests
npm run lint          # Run ESLint check
npm run format        # Run Prettier code formatting
```

---

## 📦 Production Deployment

### Build Application

```bash
npm run build
```

Output is compiled into `dist/ai-meme-generator/browser` using `tsconfig.app.json`.

### Backend Environment Rules

Ensure production instances expose:

- `GEMINI_API_KEY`
- `ALLOWED_ORIGIN` (Set to exact domain hosting the frontend)
- `ALLOWED_HOSTS` (Comma-separated list of allowed host domains for external template proxying)
- `NODE_ENV=production`

---

## 🛠️ Development Tools

| Command                    | Action                                          |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Start local Angular frontend                    |
| `cd server && npm run dev` | Start local Express proxy backend (using `tsx`) |
| `npm run build`            | Compile production frontend assets              |
| `npm run test`             | Execute unit tests with Vitest                  |
| `npm run test:e2e`         | Run Playwright end-to-end tests                 |
| `npm run lint`             | Run ESLint checks                               |
| `npm run format`           | Execute Prettier code formatting                |

---

## 🔒 Security Measures

- **Key Isolation:** API keys remain strictly on the Express backend server and are never exposed to the client bundle.
- **Payload Validation:** Image uploads undergo client-side and server-side MIME type verification and 10MB file size checks.
- **CORS & Proxy Protection:** Backend rejects origin header mismatches outside `ALLOWED_ORIGIN` and limits external template image proxying to configured `ALLOWED_HOSTS`.

---

## 🐛 Troubleshooting

**Port 4000 unavailable (`EADDRINUSE`):**

```bash
lsof -i :4000
kill -9 <PID>
```

**Missing API Key Error:**
Confirm `server/.env` contains a valid `GEMINI_API_KEY` string and that the Express server was restarted after creation.

---

## 📝 License

MIT
