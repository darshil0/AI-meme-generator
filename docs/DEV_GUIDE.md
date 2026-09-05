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
| [Testing](#-testing-strategy)              | Jest patterns, test examples                     |
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
npm install
```

### Configure Backend

```bash
cd server
cat > .env << 'EOF'
GEMINI_API_KEY=your_actual_key_here
ALLOWED_ORIGIN=http://localhost:4200
NODE_ENV=development
EOF
cd ..
```

### Start Dev Servers

```bash
# Terminal 1: Backend
cd server && npm run dev
# Output: Server running on http://localhost:4000

# Terminal 2: Frontend
npm run dev
# Output: Angular dev server on http://localhost:4200
```

### Verify Setup

```bash
npm run test              # Unit tests pass
npm run test:e2e          # Playwright E2E tests pass
npm run lint              # No linting errors
curl http://localhost:4000/api/health  # Backend responds (if health endpoint exists)
```

### IDE Setup (VS Code)

Install extensions:

- Angular Language Service
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": { "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" } }
}
```

---

## 🏗️ Architecture

### Module Hierarchy

```
MemeEditorComponent (Orchestrator)
├── TemplateGridComponent       (Template selection & search)
├── AiCaptionsComponent          (Gemini integration, tone selection)
├── LayerControlsComponent       (Text layer management)
└── FilterControlsComponent      (CSS filter application)

Services
├── ImageService                 (Image upload, canvas rendering, filters)
├── AiCaptionService             (Gemini API communication)
├── StorageService               (IndexedDB persistence)
└── ExportService                (Download, clipboard)

Utilities
└── CanvasUtils                  (Canvas rendering logic, JPEG export)
```

### File Structure

```
src/app/
├── components/
│   ├── meme-editor/
│   ├── template-grid/
│   ├── ai-captions/
│   ├── layer-controls/
│   └── filter-controls/
├── services/
│   ├── image.service.ts
│   ├── ai-caption.service.ts
│   ├── storage.service.ts
│   └── export.service.ts
├── models/
│   ├── meme.model.ts            # Domain types
│   └── constants.ts             # App-wide constants
└── utils/
    └── canvas-utils.ts          # Rendering logic
```

---

## 📚 Code Standards

### TypeScript: Strict Mode Always

```typescript
// ✅ DO: Proper types, no `any`
interface TextLayer {
  text: string;
  fontSize: number;
  color: string;
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
  selectedIndex = signal(-1);
  layerCount = computed(() => this.layers().length);

  addLayer(layer: TextLayer) {
    this.layers.update((current) => [...current, layer]);
  }
}

// ❌ DON'T: BehaviorSubject for new code
layers$ = new BehaviorSubject<TextLayer[]>([]);
```

### Linting & Formatting

```bash
npm run lint       # Check
npm run lint:fix   # Auto-fix
npm run format     # Prettier
```

---

## 🔧 Common Development Tasks

### Task 1: Add a New Image Filter

**Files affected**: `meme.model.ts`, `filter-controls.component.ts`

**Step 1: Update model** (`src/app/models/meme.model.ts`)

```typescript
export enum ImageFilter {
  NONE = 'none',
  GRAYSCALE = 'grayscale',
  HUE_ROTATE = 'hue-rotate', // Add
}

export const IMAGE_FILTER_CSS_MAP: Record<ImageFilter, string> = {
  [ImageFilter.NONE]: 'filter-none',
  [ImageFilter.GRAYSCALE]: 'grayscale(100%)',
  [ImageFilter.HUE_ROTATE]: 'hue-rotate(45deg)', // Add
};
```

**Step 2: Update component** (`filter-controls.component.ts`)

```typescript
filters = [
  { label: 'None', value: ImageFilter.NONE },
  { label: 'Grayscale', value: ImageFilter.GRAYSCALE },
  { label: 'Hue Rotate', value: ImageFilter.HUE_ROTATE }, // Add
];
```

**Step 3: Test**

```bash
npm run test -- --testPathPattern=filter-controls
```

---

### Task 2: Enhance AI Prompts

**Files affected**: `server/src/routes/captions.ts`, `ai-captions.component.ts`

**Step 1: Backend prompt** (`server/src/routes/captions.ts`)

```typescript
const BASE_PROMPT = `
  Generate 5 hilarious, sarcastic meme captions.
  Focus on wit and irony.
  Return JSON: ["caption1", "caption2", ...]
`;

// Add custom tone handling
if (tone === 'dark') {
  prompt += 'Include edgy, dark humor.';
}
```

**Step 2: Frontend context** (`ai-captions.component.ts`)

```typescript
generateCaptions() {
  const payload = {
    imageBase64: this.imageData,
    tone: this.selectedTone(),
    context: this.customContext()  // Pass user context
  };
  return this.aiService.generateCaptions(payload);
}
```

**Step 3: Test**

```bash
# Manual: Upload image, select tone, verify captions match intent
npm run test -- ai-caption.service.spec.ts
```

---

### Task 3: Add a New Component

**Step 1: Generate**

```bash
ng generate component components/meme-history
```

**Step 2: Implement**

```typescript
// meme-history.component.ts
@Component({ selector: 'app-meme-history' })
export class MemeHistoryComponent implements OnInit {
  history = signal<SavedMemeState[]>([]);

  constructor(private storage: StorageService) {}

  ngOnInit() {
    this.storage.listSessions().then((sessions) => {
      this.history.set(sessions);
    });
  }
}
```

**Step 3: Test**

```bash
npm run test -- meme-history.component.spec.ts
```

---

## 🧪 Testing Strategy

### Test Patterns (AAA Format)

**Service Test (Jest)**

```typescript
describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ImageService] });
    service = TestBed.inject(ImageService);
  });

  it('should apply filter to canvas', () => {
    // Arrange
    const canvas = document.createElement('canvas');
    const filter = ImageFilter.GRAYSCALE;

    // Act
    service.applyFilter(canvas, filter);

    // Assert
    expect(canvas.style.filter).toBe('grayscale(100%)');
  });

  it('should reject invalid MIME types', () => {
    expect(service.isValidImageType('text/plain')).toBe(false);
    expect(service.isValidImageType('image/jpeg')).toBe(true);
  });
});
```

**Component Test (Jest + DOM)**

```typescript
describe('LayerControlsComponent', () => {
  let component: LayerControlsComponent;
  let fixture: ComponentFixture<LayerControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add text layer on button click', () => {
    const button = fixture.debugElement.query(By.css('button[aria-label="Add text layer"]'));
    button.nativeElement.click();

    expect(component.layers().length).toBe(1);
  });

  it('should update layer text when input changes', fakeAsync(() => {
    component.layers.set([{ text: 'old', fontSize: 24 }]);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[type="text"]'));
    input.nativeElement.value = 'new text';
    input.nativeElement.dispatchEvent(new Event('input'));
    tick();

    expect(component.layers()[0].text).toBe('new text');
  }));
});
```

### Run Tests

```bash
npm run test                # Single run
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

---

## 📡 Backend API Reference

### POST `/api/generate-captions`

Generate AI captions from image or template.

**Request:**

```json
{
  "imageBase64": "iVBORw0KGgoAAAANS...",
  "tone": "humorous",
  "context": "Optional user context"
}
```

**Response (200):**

```json
{
  "captions": ["When you realize Monday is tomorrow", "POV: You forgot to turn off your camera"]
}
```

**Error (400):**

```json
{ "error": "Invalid tone value" }
```

---

### GET `/api/template-image?url=https://...`

Proxy external template images (CORS-safe).

**Whitelisted domains** (configured in `server/src/routes/images.ts`):

- imgflip.com
- giphy.com
- unsplash.com
- reddit.com

**Parameters:**

- `url` (required): Image URL

**Response:** Image binary (200) or error (403/404)

---

## 📚 Service APIs

### AiCaptionService

```typescript
generateCaptions(payload: {
  imageBase64?: string;
  templateName?: string;
  tone: CaptionTone;
  context?: string;
}): Promise<string[]>
```

### StorageService

```typescript
saveMeme(state: SavedMemeState): Promise<string>  // Returns ID
loadMeme(id: string): Promise<SavedMemeState | null>
listSessions(): Promise<SavedMemeState[]>
deleteSession(id: string): Promise<void>
```

### ExportService

```typescript
downloadMeme(canvas: HTMLCanvasElement, filename: string, quality: number): Promise<void>
copyToClipboard(canvas: HTMLCanvasElement): Promise<void>
```

### ImageService

```typescript
uploadImage(file: File): Promise<string>  // Returns base64
applyFilter(canvas: HTMLCanvasElement, filter: ImageFilter): void
isValidImageType(mimeType: string): boolean
```

---

## 🔒 Security & Best Practices

### API Key Management

```typescript
// ✅ Backend only – SAFE
const apiKey = process.env.GEMINI_API_KEY;
app.post('/api/captions', async (req, res) => {
  // Use apiKey here – never exposed to client
});

// ❌ Frontend – EXPOSED
const apiKey = 'sk-...';
fetch('https://api.gemini.com', { headers: { key: apiKey } });
```

### Signal Immutability

```typescript
// ✅ DO: Use update() for signals
this.layers.update((current) => [...current, newLayer]);

// ❌ DON'T: Direct mutation
this.layers().push(newLayer);
this.layers()[0].text = 'mutated';
```

### Sanitization

```typescript
// All AI captions sanitized before rendering
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(aiCaption);
```

### CORS Whitelist

All external images proxied via `/api/template-image`. Whitelist configured in `server/src/routes/images.ts`:

```typescript
const ALLOWED_DOMAINS = ['imgflip.com', 'giphy.com'];
```

---

## 🐛 Troubleshooting

| Issue                        | Cause                   | Solution                                          |
| ---------------------------- | ----------------------- | ------------------------------------------------- |
| **GEMINI_API_KEY not set**   | Missing env var         | `cd server && cat > .env` with key                |
| **Port 4000 in use**         | Another process         | `lsof -i :4000 && kill -9 <PID>`                  |
| **Canvas rendering fails**   | Canvas not mocked       | Add canvas mock in test setup                     |
| **CORS error on templates**  | Domain not whitelisted  | Add to `ALLOWED_DOMAINS` in `images.ts`           |
| **IndexedDB quota exceeded** | Too many sessions       | Implement cleanup: `storage.deleteSession(oldId)` |
| **Build: NG5002 error**      | Invalid template syntax | Check `@if/@for` syntax, not `*ngIf`              |

### Debug Mode

```typescript
// environment.ts
export const environment = {
  production: false,
  debug: true,
};

// In services
if (environment.debug) console.log('Debug:', data);
```

---

## 🤝 Contribution Workflow

### Branch Naming

```
feat/add-dark-mode
fix/canvas-rendering
refactor/storage-service
docs/api-reference
```

### Commit Convention

```
feat(ai-captions): add sarcasm tone option
fix(canvas-utils): resolve font rendering on Firefox
refactor(storage): migrate to IndexedDB
test(image.service): add compression validation
```

### Pre-Push Checklist

```bash
npm run lint:fix
npm run format
npm run test
npm run build
```

---

## 📈 Performance Checklist

- Cache canvas reference (don't recreate per render)
- Use `computed()` for derived signal state
- Lazy load heavy components with `loadComponent`
- Compress images before upload
- Monitor bundle size: `npm run build -- --stats-json`

---

## 🔗 Related Docs

- [README.md](../README.md) – Setup, features, deployment
- [CHANGELOG.md](../CHANGELOG.md) – Version history, breaking changes
- [Angular 21 Docs](https://angular.io/docs)
- [Gemini API Reference](https://ai.google.dev/docs)

---

**Last Updated**: 2026-09-05 | **Version**: 1.11.0
