# AI Meme Generator – Developer's Guide (v1.11.0)

Comprehensive technical reference for developers contributing to the AI Meme Generator.

---

## 📋 Quick Links

| Resource                                   | Purpose                                          |
| ------------------------------------------ | ------------------------------------------------ |
| [Setup](#-first-time-setup)                | Get environment running locally                  |
| [Architecture](#-architecture)             | Understand module structure                      |
| [Services](#-service-apis)                 | API reference for all services                   |
| [Code Standards](#-code-standards)         | TypeScript, Angular, naming conventions          |
| [Common Tasks](#-common-development-tasks) | Filter, prompt, component walkthroughs with code |
| [Testing](#-testing-strategy)              | Vitest & Playwright patterns, test examples      |
| [API Endpoints](#-backend-api-reference)   | Gemini proxy, image proxy routes                 |
| [Troubleshooting](#-troubleshooting)       | Common issues + solutions                        |

---

## 🚀 First-Time Setup

### Prerequisites

```bash
node --version  # v18+
npm --version   # v9+
```

### Clone & Install

```bash
git clone https://github.com/your-org/ai-meme-generator.git
cd ai-meme-generator
npm install --legacy-peer-deps
cd server && npm install && cd ..
```

### Configure Backend

```bash
cd server
cat > .env << 'EOF'
GEMINI_API_KEY=your_actual_key_here
ALLOWED_ORIGIN=http://localhost:4200
ALLOWED_HOSTS=i.imgur.com,imgflip.com,i.imgflip.com,memegen.link,i.redd.it,giphy.com,media.giphy.com,unsplash.com,images.unsplash.com
NODE_ENV=development
PORT=4000
EOF
cd ..
```

### Start Dev Servers

```bash
# Terminal 1: Backend
cd server && npm run dev
# Output: Server running on http://localhost:4000 (via tsx)

# Terminal 2: Frontend
npm run dev
# Output: Angular dev server on http://localhost:4200
```

### Verify Setup

```bash
npm run test              # Vitest unit tests pass
npm run test:e2e          # Playwright E2E tests pass
npm run lint              # No linting errors
curl http://localhost:4000/api/health  # Backend responds {"status":"ok"}
```

---

## 🏗️ Architecture

### Module Hierarchy

```
MemeEditorComponent (Orchestrator)
├── TemplateGridComponent       (Template selection & search)
├── AiCaptionsComponent          (Gemini tone selection & generation trigger)
├── LayerControlsComponent       (Text layer management & styling)
└── FilterControlsComponent      (CSS image filter selection)

Services
├── GeminiService                (Communicates with Express Gemini backend endpoints)
├── StorageService               (IndexedDB persistence via idb-keyval)
└── ExportService                (Canvas JPEG download & PNG clipboard copy)

Utilities
└── CanvasUtils                  (Canvas rendering logic, filter application, export conversion)
```

### File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── meme-editor/
│   │   ├── template-grid/
│   │   ├── ai-captions/
│   │   ├── layer-controls/
│   │   └── filter-controls/
│   ├── services/
│   │   ├── gemini.service.ts
│   │   ├── storage.service.ts
│   │   └── export.service.ts
│   ├── models/
│   │   ├── meme.model.ts            # Domain types, constants, filter maps
│   │   └── api-types.ts             # Shared frontend/backend API interfaces & CaptionTone enum
│   ├── utils/
│   │   └── canvas-utils.ts          # Canvas rendering logic
│   └── app.component.ts             # Shell component
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
server/
├── src/
│   ├── lib/
│   │   └── geminiClient.ts          # @google/genai SDK integration
│   ├── middleware/
│   │   ├── error.ts                 # Express error middleware
│   │   └── logger.ts                # Express logger middleware
│   ├── models/
│   │   └── api-types.ts             # Shared backend API interfaces
│   ├── routes/
│   │   ├── captions.ts              # Gemini caption routes
│   │   └── images.ts                # CORS template image proxy
│   └── index.ts                     # Express app initialization
```

---

## 📚 Code Standards

### TypeScript: Strict Mode Always

```typescript
// ✅ DO: Proper types, no `any`
interface TextLayer {
  id: number;
  text: string;
  fontSize: number;
  fontColor: string;
  outlineColor: string;
  textBlur: number;
  top: number;
}

// ✅ DO: Use enums for fixed values
enum ImageFilter {
  NONE = 'none',
  GRAYSCALE = 'grayscale',
  SEPIA = 'sepia',
}

// ❌ DON'T: Avoid `any` and non-null assertions
function process(img: any): any {}
const layer = layers[0]!;
```

### Naming Conventions

| Item      | Pattern          | Example                    |
| --------- | ---------------- | -------------------------- |
| Files     | kebab-case       | `meme-editor.component.ts` |
| Classes   | PascalCase       | `MemeEditorComponent`      |
| Functions | camelCase        | `renderMeme()`             |
| Constants | UPPER_SNAKE_CASE | `MAX_LAYERS`               |
| Signals   | camelCase        | `layers = signal([])`      |
| Private   | `#fieldName`     | `#canvasRef`               |

### Angular Signals Pattern

```typescript
// ✅ DO: Use signals + computed
export class MemeEditorComponent {
  layers = signal<TextLayer[]>([]);
  selectedLayerIndex = signal<number | null>(null);
  layerCount = computed(() => this.layers().length);

  addLayer(layer: TextLayer) {
    this.layers.update((current) => [...current, layer]);
  }
}
```

---

## 🔧 Common Development Tasks

### Task 1: Add a New Image Filter

**Files affected**: `src/app/models/meme.model.ts`, `src/app/components/meme-editor/meme-editor.component.ts`

**Step 1: Update enum & CSS map** (`src/app/models/meme.model.ts`)

```typescript
export enum ImageFilter {
  NONE = 'none',
  GRAYSCALE = 'grayscale',
  VINTAGE = 'vintage', // Add new enum value
}

export const IMAGE_FILTER_CSS_MAP: Record<ImageFilter, string> = {
  [ImageFilter.NONE]: 'none',
  [ImageFilter.GRAYSCALE]: 'grayscale(100%)',
  [ImageFilter.VINTAGE]: 'sepia(50%) contrast(120%)', // Add CSS mapping
};
```

**Step 2: Update component filters list** (`src/app/components/meme-editor/meme-editor.component.ts`)

```typescript
filters: ImageFilter[] = [
  ImageFilter.NONE,
  ImageFilter.GRAYSCALE,
  ImageFilter.VINTAGE, // Add to available filter buttons
];
```

---

### Task 2: Enhance AI Prompts

**Files affected**: `server/src/lib/geminiClient.ts`

```typescript
export async function generateCaptionsFromImage(
  base64ImageData: string,
  mimeType: string,
  tone: string,
  context: string,
): Promise<string[]> {
  let prompt = `Analyze this image and generate 5 short, witty, and funny captions suitable for a meme. The captions should be in the style of popular internet memes. The tone should be ${tone}.`;
  if (context.trim()) {
    prompt += `\n\nConsider this context for inspiration: "${context}".`;
  }
  prompt += `\n\nIMPORTANT: Return the result as a JSON array of 5 strings.`;

  const contents = {
    parts: [{ text: prompt }, { inlineData: { mimeType, data: base64ImageData } }],
  };

  return generateCaptions(contents);
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```typescript
describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExportService] });
    service = TestBed.inject(ExportService);
  });

  it('should copy canvas PNG image to clipboard', async () => {
    const canvas = document.createElement('canvas');
    const result = await service.copyToClipboard(canvas);
    expect(result).toBe(true);
  });
});
```

### End-to-End Tests (Playwright)

Run Playwright E2E tests covering editor interaction:

```bash
npm run test:e2e
```

---

## 📡 Backend API Reference

### POST `/api/generate-captions-from-image`

Generate AI captions from base64 image data.

**Request Body:**

```json
{
  "imageBase64": "iVBORw0KGgoAAAAN...",
  "mimeType": "image/png",
  "tone": "humorous",
  "context": "programming bug"
}
```

**Response (200 OK):**

```json
{
  "captions": ["When it works on local", "Feature, not a bug"],
  "tone": "humorous",
  "success": true
}
```

---

### POST `/api/generate-captions-from-text`

Generate AI captions from template name text.

**Request Body:**

```json
{
  "templateName": "Distracted Boyfriend",
  "tone": "sarcastic",
  "context": "learning new framework"
}
```

**Response (200 OK):**

```json
{
  "captions": ["Me looking at Angular 21", "Old tech stack vs New tech stack"],
  "tone": "sarcastic",
  "success": true
}
```

---

### GET `/api/template-image?url=https://...`

Proxy external meme template images securely with CORS headers and host verification.

---

### GET `/api/config-status`

Returns whether `GEMINI_API_KEY` is configured on the backend server.

---

### GET `/api/health`

Health check returning `{"status": "ok"}`.

---

## 🔒 Security & Best Practices

- **Backend Key Isolation:** The Gemini API key is managed server-side via `process.env.GEMINI_API_KEY` and is never shipped to client code.
- **MIME Validation:** Server and client validate file MIME types strictly (`SUPPORTED_MIME_TYPES`).
- **Host Whitelisting:** External template proxy enforces strict domain checks against `ALLOWED_HOSTS`.

---

**Last Updated**: 2026-09-05 | **Version**: 1.11.0
