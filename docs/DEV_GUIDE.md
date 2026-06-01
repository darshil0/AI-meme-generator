# AI Meme Generator – Developer's Guide (v1.9.1)

Comprehensive technical documentation for developers contributing to or extending the AI Meme Generator project.

**Quick Links:** [README](../README.md) | [CHANGELOG](../CHANGELOG.md) | [API Reference](#api-reference) | [Troubleshooting](#-troubleshooting)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Development Setup](#-development-setup)
4. [Code Quality & Standards](#-code-quality--standards)
5. [Common Development Tasks](#-common-development-tasks)
6. [Testing Strategy](#-testing-strategy)
7. [API Reference](#api-reference)
8. [Performance & Optimization](#-performance--optimization)
9. [Security Best Practices](#-security-best-practices)
10. [Contribution Guidelines](#-contribution-guidelines)
11. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

### Vision: "Demand Elegance"

This project prioritizes **clean code architecture**, **type safety**, and **separation of concerns** over quick hacks. Every module is designed to be testable, maintainable, and scalable.

### Core Principles

- **Modularity**: Small, focused modules with single responsibilities
- **Type Safety**: Strict TypeScript with zero `any` types
- **Reactivity**: Angular Signals for fine-grained reactive state
- **Security**: API keys only on backend; frontend gets proxied requests
- **Testing**: Unit tests for all services; integration tests for flows
- **Documentation**: Code is self-documenting; complex logic has comments

### Project Stats

- **Frontend**: ~2,500 lines of TypeScript + templates
- **Backend**: ~500 lines of Express.js
- **Test Coverage**: 85%+ for services, 60%+ for components
- **Bundle Size**: ~450 KB (optimized), ~120 KB (gzipped)

---

## 🏗️ Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Frontend                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │          MemeEditorComponent (Orchestrator)       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │  Template    │  │  AI Captions │  │  Layers  │ │ │
│  │  │  Grid        │  │  Component   │  │  Control │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │ Services                            │
│  ┌─────────────────▼──────────────────────────────────┐ │
│  │  ImageService │ StorageService │ AiCaptionService  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │             CanvasUtils (Rendering)                │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTP
           ┌───────────────▼────────────────┐
           │    Express Backend Proxy       │
           │  ┌────────────────────────────┐│
           │  │ /api/generate-captions     ││
           │  │ /api/template-image        ││
           │  │ Error Handling Middleware  ││
           │  └────────────────────────────┘│
           └────────────┬────────────────────┘
                        │
            ┌───────────▼──────────────┐
            │  Google Gemini API       │
            │  (with API Key)          │
            └──────────────────────────┘
```

### Directory Structure

```
ai-meme-generator/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── meme-editor/           # Main orchestrator
│   │   │   ├── template-grid/         # Template selection
│   │   │   ├── ai-captions/           # AI integration
│   │   │   ├── layer-controls/        # Text layer management
│   │   │   └── filter-controls/       # Image filters
│   │   ├── services/
│   │   │   ├── image.service.ts       # Image processing & canvas rendering
│   │   │   ├── storage.service.ts     # IndexedDB persistence
│   │   │   ├── ai-caption.service.ts  # Gemini API communication
│   │   │   └── export.service.ts      # Download & clipboard
│   │   ├── models/
│   │   │   ├── meme.model.ts          # Core domain models
│   │   │   └── constants.ts           # App-wide constants
│   │   └── utils/
│   │       └── canvas-utils.ts        # Canvas rendering logic
│   ├── environments/
│   │   ├── environment.ts             # Development config
│   │   └── environment.prod.ts        # Production config
│   ├── assets/
│   │   ├── templates/                 # Meme template data
│   │   └── fonts/                     # Custom fonts (Anton, Impact)
│   ├── index.html
│   └── main.ts
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── captions.ts            # /api/generate-captions
│   │   │   └── images.ts              # /api/template-image
│   │   ├── middleware/
│   │   │   ├── logger.ts              # Request logging
│   │   │   ├── error.ts               # Error handling
│   │   │   └── cors.ts                # CORS configuration
│   │   └── index.ts                   # Express app setup
│   ├── .env                           # Secrets (gitignored)
│   └── package.json
├── docs/
│   ├── DEV_GUIDE.md                   # This file
│   ├── MIGRATION_1.5.0.md             # Breaking change guides
│   └── FAQ.md
├── proxy.conf.json                    # Dev proxy config
├── angular.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Service Responsibilities

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `ImageService` | Image upload, template loading, canvas rendering | `uploadImage()`, `renderMeme()`, `applyFilter()` |
| `StorageService` | IndexedDB persistence for memes & templates | `saveMeme()`, `loadMeme()`, `deleteSession()` |
| `AiCaptionService` | Gemini API communication | `generateCaptions()` |
| `ExportService` | JPEG download, clipboard copy | `downloadMeme()`, `copyToClipboard()` |

---

## 🛠️ Development Setup

### Prerequisites

- Node.js v18+ (verify: `node --version`)
- npm v9+ or yarn v3+ (verify: `npm --version`)
- Git
- Cairo (for canvas support in tests)
  - **macOS**: `brew install cairo`
  - **Ubuntu/Debian**: `sudo apt-get install libcairo2-dev`
  - **Windows**: Installed via npm postinstall

### First-Time Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-org/ai-meme-generator.git
   cd ai-meme-generator
   npm install
   ```

2. **Create Backend Secrets**
   ```bash
   cd server
   cat > .env << EOF
   GEMINI_API_KEY=your_actual_key_here
   ALLOWED_ORIGIN=http://localhost:4200
   NODE_ENV=development
   EOF
   cd ..
   ```

3. **Verify Setup**
   ```bash
   npm run dev    # Both frontend and backend start
   npm run test   # Tests pass
   ```

### Development Workflow

**Terminal 1 – Backend:**
```bash
cd server
npm run dev
# Output: Server running on http://localhost:4000
```

**Terminal 2 – Frontend:**
```bash
npm run dev
# Output: Angular dev server on http://localhost:4200
```

**Terminal 3 – Tests (watch mode):**
```bash
npm run test:watch
```

### IDE Setup

**Recommended: VS Code**

Install extensions:
- **Angular Language Service** (Angular)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Tailwind IntelliSense** (bradlc.vscode-tailwindcss)

Add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 🎨 Code Quality & Standards

### TypeScript Standards

**✅ DO:**
```typescript
// Use proper types, never `any`
interface TextLayer {
  text: string;
  fontSize: number;
  color: string;
}

function renderText(layer: TextLayer): void {
  // Implementation
}

// Use enums for fixed value sets
enum ImageFilter {
  NONE = 'none',
  GRAYSCALE = 'grayscale',
  SEPIA = 'sepia'
}

// Use constants for configuration
const MEME_CONSTANTS = {
  MAX_LAYERS: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  DEFAULT_QUALITY: 0.95
} as const;
```

**❌ DON'T:**
```typescript
// Avoid `any`
function processImage(img: any): any { }

// Avoid non-null assertions
const image = images[0]!;

// Avoid string literals for fixed values
const filter = 'grayscale'; // Use enum instead
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files (components) | kebab-case | `meme-editor.component.ts` |
| Classes | PascalCase | `MemeEditorComponent` |
| Interfaces | PascalCase, no `I` prefix | `TextLayer` |
| Functions | camelCase | `renderMeme()` |
| Constants | UPPER_SNAKE_CASE | `MAX_LAYERS` |
| Private properties | #fieldName or _fieldName | `#canvasRef` |
| Signals | camelCase | `layers = signal([])` |

### Angular Signals Best Practices

**✅ DO – Use Signals for reactive state:**
```typescript
export class MemeEditorComponent {
  // Declare signals
  layers = signal<TextLayer[]>([]);
  selectedLayerIndex = signal<number>(-1);

  // Computed for derived state
  layerCount = computed(() => this.layers().length);

  // Update state
  addLayer(layer: TextLayer): void {
    this.layers.update(current => [...current, layer]);
  }

  // Track changes
  constructor() {
    effect(() => {
      console.log('Layers changed:', this.layers());
    });
  }
}
```

**❌ DON'T – Use BehaviorSubject or Subject:**
```typescript
// Avoid unless you need subjects specifically
layers$ = new BehaviorSubject<TextLayer[]>([]);
```

### Linting & Formatting

**Before committing:**
```bash
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
npm run format     # Format with Prettier
```

**In CI/CD**, linting fails the build.

---

## 🔧 Common Development Tasks

### Task 1: Adding a New Image Filter

**Goal**: Add a "Hue Rotate" filter to the application.

**Steps:**

1. **Update the model** (`src/app/models/meme.model.ts`):
   ```typescript
   export enum ImageFilter {
     NONE = 'none',
     GRAYSCALE = 'grayscale',
     SEPIA = 'sepia',
     INVERT = 'invert',
     BLUR = 'blur',
     HUE_ROTATE = 'hue-rotate',  // Add new filter
     // ... others
   }

   export const IMAGE_FILTER_CSS_MAP: Record<ImageFilter, string> = {
     [ImageFilter.NONE]: 'filter-none',
     [ImageFilter.GRAYSCALE]: 'grayscale(100%)',
     [ImageFilter.HUE_ROTATE]: 'hue-rotate(45deg)',
     // ... others
   };
   ```

2. **Update component** (`src/app/components/filter-controls/filter-controls.component.ts`):
   ```typescript
   filters = [
     { label: 'None', value: ImageFilter.NONE },
     { label: 'Grayscale', value: ImageFilter.GRAYSCALE },
     { label: 'Hue Rotate', value: ImageFilter.HUE_ROTATE },
     // ... others
   ];
   ```

3. **Update template** (`filter-controls.component.html`):
   ```html
   <button *ngFor="let filter of filters"
           [class.active]="selectedFilter() === filter.value"
           (click)="selectFilter(filter.value)">
     {{ filter.label }}
   </button>
   ```

4. **Test**:
   ```bash
   npm run test       # Verify no regressions
   npm run test:watch # Watch for changes
   ```

### Task 2: Modifying AI Prompt

**Goal**: Make captions more sarcastic by default.

**Steps:**

1. **Backend** (`server/src/routes/captions.ts`):
   ```typescript
   const BASE_PROMPT = `
     Generate 5 hilarious, sarcastic meme captions for an image.
     Focus on wit, irony, and observational humor.
     Format as JSON: ["caption1", "caption2", "caption3", "caption4", "caption5"]
   `;
   ```

2. **Add context** (`src/app/components/ai-captions/ai-captions.component.ts`):
   ```typescript
   if (this.customContext()) {
     prompt += `Additional context: ${this.customContext()}`;
   }
   ```

3. **Test with real images**:
   ```bash
   npm run dev
   # Upload test image, verify captions feel more sarcastic
   ```

### Task 3: Adding a New Component

**Goal**: Create a "Meme History" component to show recent creations.

**Steps:**

1. **Generate scaffold**:
   ```bash
   ng generate component components/meme-history
   ```

2. **Implement**:
   ```typescript
   // meme-history.component.ts
   import { Component, OnInit } from '@angular/core';
   import { StorageService } from '../../services/storage.service';

   @Component({
     selector: 'app-meme-history',
     templateUrl: './meme-history.component.html'
   })
   export class MemeHistoryComponent implements OnInit {
     history = signal<SavedMemeState[]>([]);

     constructor(private storage: StorageService) {}

     ngOnInit() {
       this.loadHistory();
     }

     private async loadHistory() {
       const sessions = await this.storage.listSessions();
       this.history.set(sessions);
     }

     loadMeme(id: string) {
       // Implementation
     }
   }
   ```

3. **Add to parent**:
   ```html
   <!-- meme-editor.component.html -->
   <app-meme-history (memeSelected)="loadMeme($event)"></app-meme-history>
   ```

4. **Test**:
   ```bash
   npm run test   # Unit tests
   npm run dev    # Manual testing
   ```

---

## 🧪 Testing Strategy

### Test Structure

```
src/app/
├── services/
│   ├── image.service.ts
│   └── image.service.spec.ts      # Unit test
├── components/
│   ├── meme-editor/
│   │   ├── meme-editor.component.ts
│   │   └── meme-editor.component.spec.ts  # Component test
└── utils/
    ├── canvas-utils.ts
    └── canvas-utils.spec.ts        # Utility test
```

### Running Tests

```bash
# Single run
npm run test

# Watch mode (recommended during development)
npm run test:watch

# With coverage
npm run test:coverage
```

### Writing Tests

**Service Test Example** (`image.service.spec.ts`):
```typescript
import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageService]
    });
    service = TestBed.inject(ImageService);
  });

  it('should apply filter to canvas', async () => {
    // Arrange
    const canvas = document.createElement('canvas');
    const filter = ImageFilter.GRAYSCALE;

    // Act
    service.applyFilter(canvas, filter);

    // Assert
    expect(canvas.style.filter).toBe('grayscale(100%)');
  });

  it('should validate image MIME type', () => {
    expect(service.isValidImageType('image/jpeg')).toBe(true);
    expect(service.isValidImageType('text/plain')).toBe(false);
  });
});
```

**Component Test Example**:
```typescript
describe('MemeEditorComponent', () => {
  let component: MemeEditorComponent;
  let fixture: ComponentFixture<MemeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemeEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MemeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add text layer on button click', () => {
    const button = fixture.debugElement.query(
      By.css('button[aria-label="Add text layer"]')
    );
    button.nativeElement.click();
    
    expect(component.layers().length).toBe(1);
  });
});
```

### Coverage Goals

- **Services**: 90%+ (critical business logic)
- **Components**: 70%+ (integration, user interaction)
- **Utils**: 95%+ (reusable logic)
- **Overall**: 80%+ (healthy codebase)

Check coverage:
```bash
npm run test:coverage
open coverage/index.html
```

---

## API Reference

### Backend Endpoints

#### POST `/api/generate-captions`

Generate AI captions from an image or template name.

**Request:**
```json
{
  "imageBase64": "iVBORw0KGgoAAAANS...",
  "tone": "humorous",
  "context": "This is a cat doing something funny"
}
```

**Response (200):**
```json
{
  "captions": [
    "When you realize Monday is tomorrow",
    "Me pretending to work when the boss walks by",
    "That one friend who's always late",
    "POV: You forgot to turn off your camera",
    "When autocorrect saves the day"
  ]
}
```

**Error (400):**
```json
{
  "error": "Invalid tone value",
  "details": "Tone must be one of: humorous, sarcastic, wholesome, absurd, dark"
}
```

**Error (500):**
```json
{
  "error": "API error",
  "details": "Gemini API returned an error"
}
```

#### GET `/api/template-image?url=https://...`

Proxy for external meme template images (CORS-safe).

**Parameters:**
- `url` (string, required): Full URL of the template image

**Response:**
- 200: Image binary data (JPEG/PNG)
- 403: URL not whitelisted
- 404: Image not found

**Whitelisted Domains:**
- imgflip.com
- media.giphy.com
- images.unsplash.com
- reddit.com
- And others in `server/src/routes/images.ts`

### Frontend Services

#### `AiCaptionService`

```typescript
// Generate captions from image
generateCaptions(
  imageBase64: string,
  tone: CaptionTone,
  context?: string
): Promise<string[]>

// Generate captions from template name
generateCaptionsFromText(
  templateName: string,
  tone: CaptionTone
): Promise<string[]>
```

#### `StorageService`

```typescript
// Save a meme state
saveMeme(meme: SavedMemeState): Promise<string> // returns ID

// Load a meme by ID
loadMeme(id: string): Promise<SavedMemeState | null>

// List all saved sessions
listSessions(): Promise<SavedMemeState[]>

// Delete a session
deleteSession(id: string): Promise<void>
```

#### `ExportService`

```typescript
// Download meme as JPEG
downloadMeme(canvas: HTMLCanvasElement, filename: string, quality: number): Promise<void>

// Copy meme to clipboard
copyToClipboard(canvas: HTMLCanvasElement): Promise<void>
```

---

## 📈 Performance & Optimization

### Key Performance Metrics

Target metrics for a good user experience:

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint (FCP) | < 1.5s | Chrome DevTools |
| Largest Contentful Paint (LCP) | < 2.5s | Chrome DevTools |
| Cumulative Layout Shift (CLS) | < 0.1 | Chrome DevTools |
| JavaScript Size | < 150 KB | `npm run build` |
| Image Rendering Time | < 500ms | Canvas profiling |

### Optimization Strategies

**1. Canvas Rendering**
```typescript
// ✅ DO: Cache canvas reference
const canvas = document.getElementById('meme-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false })!;

// ❌ DON'T: Recreate every render
const ctx = document.getElementById('meme-canvas').getContext('2d');
```

**2. Signals Efficiency**
```typescript
// ✅ DO: Use computed() for derived state
const layerCount = computed(() => this.layers().length);

// ❌ DON'T: Compute in template
{{ layers().length }}
```

**3. Lazy Loading**
```typescript
// ✅ DO: Lazy load heavy components
const routes: Routes = [
  {
    path: 'editor',
    component: MemeEditorComponent
  },
  {
    path: 'gallery',
    loadComponent: () => import('./gallery').then(m => m.GalleryComponent)
  }
];
```

**4. Image Optimization**
```typescript
// ✅ DO: Compress images before upload
const compressed = await this.imageService.compressImage(file, 0.8);

// ✅ DO: Use WebP when possible
<picture>
  <source srcset="template.webp" type="image/webp">
  <img src="template.jpg" alt="Meme template">
</picture>
```

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --stats-json
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/stats.json
```

---

## 🔒 Security Best Practices

### API Key Management

**✅ DO:**
```typescript
// Backend only – API key in .env
const apiKey = process.env.GEMINI_API_KEY;
app.post('/api/captions', (req, res) => {
  // Use apiKey here – safe!
});
```

**❌ DON'T:**
```typescript
// Frontend – API key exposed to users!
const apiKey = 'sk-...';
fetch('https://api.gemini.com/...', { headers: { key: apiKey } });
```

### Input Validation

```typescript
// ✅ DO: Validate all user inputs
if (!isValidImageType(file.type)) {
  throw new Error('Invalid image type');
}

if (file.size > MEME_CONSTANTS.MAX_FILE_SIZE) {
  throw new Error('File too large');
}

// ✅ DO: Sanitize user content
const sanitizedText = DOMPurify.sanitize(userText);
```

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' cdn.jsdelivr.net;
  img-src 'self' data: https:;
  font-src 'self' fonts.googleapis.com;
  style-src 'self' 'unsafe-inline' cdn.tailwindcss.com;
  connect-src 'self' localhost:4000 api.gemini.com;
">
```

### HTTPS & CORS

```typescript
// server/src/middleware/cors.ts
const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(',') || [];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  maxAge: 3600
}));
```

---

## 🤝 Contribution Guidelines

### Before You Start

1. **Fork the repository** on GitHub
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-feature
   ```
3. **Make your changes** following code standards above
4. **Write tests** for new functionality
5. **Run linting**:
   ```bash
   npm run lint:fix
   npm run format
   npm run test
   ```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ai-captions): add sarcasm tone option
fix(canvas-utils): resolve font rendering on Firefox
refactor(storage): migrate LocalStorage to IndexedDB
docs(README): clarify deployment steps
test(image.service): add compression validation
chore(deps): update Angular to v21.0.1
```

**Format**: `<type>(<scope>): <message>`

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### Pull Request Process

1. **Title**: Use conventional commit format
2. **Description**: Explain what, why, and how
3. **Related Issues**: Link to GitHub issues (closes #123)
4. **Testing**: Describe manual test steps
5. **Screenshots**: For UI changes, include before/after

**Example PR:**
```markdown
## Description
Adds a new "Wholesome" caption tone to the AI suggestion system.

## Changes
- Added WHOLESOME to CaptionTone enum
- Updated Gemini prompt to generate uplifting captions
- Added UI toggle in AiCaptionsComponent
- Added unit tests for new tone

## How to Test
1. Open meme editor
2. Click "Magic Captions"
3. Select "Wholesome" tone
4. Verify captions are positive and uplifting

Closes #456
```

### Code Review Checklist

- [ ] Code follows style guide (ESLint, Prettier)
- [ ] Tests added/updated
- [ ] Types are correct (no `any`)
- [ ] No console.logs or debugger statements
- [ ] Performance impact is minimal
- [ ] Documentation is updated
- [ ] Commit messages follow convention

---

## 🐛 Troubleshooting

### Common Issues

#### **"GEMINI_API_KEY is not set"**

**Cause**: Environment variable missing
**Solution**:
```bash
cd server
cat > .env << EOF
GEMINI_API_KEY=your_key_here
ALLOWED_ORIGIN=http://localhost:4200
EOF
```

#### **"Port 4000 already in use"**

**Cause**: Another process using the port
**Solution**:
```bash
# Find process
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port in server/index.ts
const PORT = 4001;
```

#### **"Canvas rendering fails on test"**

**Cause**: Canvas not mocked properly
**Solution**:
```typescript
// In test setup
import { createCanvas } from 'canvas';
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  fillText: jest.fn()
}));
```

#### **"CORS errors when loading templates"**

**Cause**: Template URL not whitelisted
**Solution**: Add domain to `server/src/routes/images.ts`:
```typescript
const ALLOWED_DOMAINS = [
  'imgflip.com',
  'your-new-domain.com'  // Add here
];
```

#### **"IndexedDB quota exceeded"**

**Cause**: Too many large meme states saved
**Solution**:
```typescript
// Clear old sessions
await storageService.deleteSession(oldSessionId);

// Or implement cleanup
const sessions = await storage.listSessions();
if (sessions.length > 20) {
  // Delete oldest sessions
}
```

#### **"Build fails: NG5002 template error"**

**Cause**: Invalid template syntax
**Solution**:
```bash
# Check for common issues
ng build --verbose

# Fix invalid @if/@for syntax
# Old: *ngIf="condition"
# New: @if (condition) { ... }
```

### Debug Mode

**Enable debug logging:**
```typescript
// environment.ts
export const environment = {
  production: false,
  debug: true  // Add this
};

// In any service:
import { environment } from '../../environments/environment';

if (environment.debug) {
  console.log('Debug info:', data);
}
```

**Chrome DevTools:**
- Open DevTools (`F12`)
- Go to Application → IndexedDB to inspect stored memes
- Check Network tab for `/api` calls
- Use Performance tab to profile rendering

---

## 📚 Additional Resources

- [Angular 21 Docs](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Gemini API Reference](https://ai.google.dev/docs)
- [Keep a Changelog](https://keepachangelog.com/)

---

## 📞 Getting Help

- **GitHub Issues**: Report bugs or suggest features
- **Discussions**: Ask questions and share ideas
- **Email**: team@example.com

---

**Last Updated**: 2026-05-31 | **Author**: Darshil | **Version**: 1.9.1

For the latest changes, see [CHANGELOG.md](../CHANGELOG.md).
