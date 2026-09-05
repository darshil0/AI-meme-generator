# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Batch meme generation (create multiple variations at once)
- Template marketplace for community-created templates
- Advanced image editing tools (crop, rotate, skew)

---

## [1.11.0] - 2026-09-05

### Added

- **Playwright E2E & SIT Testing**: Implemented end-to-end automated testing suite in `e2e/meme-editor.spec.ts` covering title verification, template selection, image uploads, text layer editing, dark mode toggle, filter application, and IndexedDB session save/load state.
- **Backend Modernization**: Integrated `tsx` watch mode for seamless native Node.js ES Module resolution during development.
- **Dedicated Application TSConfig**: Added `tsconfig.app.json` for Angular CLI compilation to eliminate unused test file warnings during `ng build`.

### Changed

- **Dependencies Upgrade**: Updated frontend and backend dependencies to latest compatible versions:
  - Angular CLI & Angular Core to 21.2.x
  - TypeScript to 5.9.x
  - `@google/genai` to 1.52.0
  - `@playwright/test` to 1.63.0
  - `@typescript-eslint/*` to 8.69.0
  - `prettier` to 3.9.6, `postcss` to 8.5.28, `autoprefixer` to 10.5.5
- **Build Configurations**: Cleaned up `angular.json` by removing deprecated `defaultProject` field and pointing `tsConfig` to `tsconfig.app.json`.
- **Vitest Scoping**: Configured `vitest.config.ts` to exclude `e2e/**` tests from unit test execution.

### Fixed

- **Component Data Binding**: Fixed missing `[selectedLayer]="selectedLayer()"` input binding on `<app-layer-controls>` in `MemeEditorComponent` template.
- **Component Input Bindings**: Fixed `[filters]="filters"` and `[selectedFilter]="imageFilter()"` input bindings on `<app-filter-controls>` in `MemeEditorComponent` template.
- **Session State Restoration**: Fixed `loadState()` in `MemeEditorComponent` to restore `selectedLayerIndex` (defaulting to 0) and preserve `selectedImage` upon restoring saved work.
- **PostCSS Deprecation**: Fixed deprecated CSS `color-adjust: exact` rule in `meme-editor.component.scss` to standard `print-color-adjust: exact`.
- **Backend ES Modules**: Fixed Node.js ESM relative imports in `server/src/index.ts` and `server/src/routes/captions.ts` to include `.js` extension.

---

## [1.10.0] - 2026-07-02

### Added

- **Dark Mode Support**: Full dark/light theme toggle with system preference detection and persistence via IndexedDB
- **Visual Verification**: Automated UI theme verification using Playwright-based visual auditing
- **Hardened Type Safety**: Eliminated 45+ `any` type instances across the entire full-stack codebase

### Changed

- **Gemini Integration**: Updated to `gemini-2.0-flash` with improved response parsing and strict error handling
- **State Management**: Refactored `SavedMemeState` to support schema versioning and optional image dimensions for smoother migrations
- **Dependency Health**: Upgraded critical security dependencies:
  - `vitest` to 4.1.9 (fixed vulnerability)
  - `@babel/core` to 7.29.0 (fixed vulnerability)
- **Tooling Consistency**: Locked ESLint v9 and `@angular/compiler-cli` versions to resolve peer dependency conflicts

### Fixed

- **Backend API**: Resolved response structure mismatch between `@google/genai` SDK and server-side client
- **Test Stability**: Improved unit test mocks for `HttpClient` and `StorageService` for more reliable CI runs

---

## [1.9.1] - 2026-05-31

### Added

- `vitest.config.ts` configuration for proper frontend test scoping and backend directory exclusion

### Changed

- **Dependency Upgrades**: Updated all frontend and backend dependencies to latest stable MINOR and PATCH versions:
  - Angular CLI from 21.x to 21.x (latest patch)
  - Tailwind CSS to 3.x (latest patch)
  - TypeScript to 5.8.x (latest patch)
  - All transitive dependencies updated for security and performance

### Fixed

- **Linting & Formatting**: Resolved all ESLint warnings project-wide (unused variables, inconsistent formatting, etc.)
- **Test Canvas Implementation**: Added `canvas` dependency to properly mock `HTMLCanvasElement.toDataURL()` in test environment
- **Configuration**: Ensured `vitest.config.ts` properly excludes backend tests from frontend test runs

---

## [1.9.0] - 2026-03-15

### Added

- **Premium Typography**: Integrated Google Font **Anton** for high-quality meme text rendering with fallback to Impact
- **Service Testing**: Comprehensive unit test suite for `ExportService` covering clipboard and download functionality
- **Design System**: HSL-based color system for vibrant, tailored glass-morphism visual effects

### Changed

- **Canvas Rendering**: Optimized font stacking strategy in `CanvasUtils` for cross-platform consistency and quality
- **Visual Effects**: Refactored glass-styled components to use HSL-derived accent colors for better visual cohesion
- **Code Quality**: Improved TypeScript strict mode compliance across all services

### Fixed

- **Font Rendering**: Fixed font fallback issues on Windows and Linux systems
- **Test Coverage**: Added missing test cases for edge cases in export functionality

---

## [1.8.0] - 2026-03-05

### Added

- **Export Service**: New dedicated `ExportService` module for clipboard copy and file download operations (separation of concerns)
- **Context Controls**: "Clear Context" button in AI Suggestions panel for better UX control
- **Animation Transitions**: Glass-morphism entry animations (`fade-in-up`) for improved visual feedback

### Changed

- **Component Architecture**: Restored and optimized `MemeEditorComponent` template using v1.7.0 performance patterns
- **Service Organization**: Moved export logic from component into dedicated service for better testability

### Fixed

- **Backend Security**: Implemented strict MIME type validation in image proxy to prevent non-image resource fetching
- **Type Safety**: Fixed type assertions in template bindings

---

## [1.7.0] - 2026-02-15

### Added

- **Canvas Utility Module**: Extracted meme rendering logic into standalone `CanvasUtils` for reusability and testability
- **Async Storage Integration**: Fully integrated `StorageService` (IndexedDB) across `MemeEditorComponent` with proper async/await patterns

### Changed

- **AI Model**: Updated server-side Gemini model from `gemini-2.0-flash-exp` to `gemini-2.0-flash` for stability and cost optimization
- **Error Reporting**: Enhanced backend error messages for AI generation failures with more context
- **Code Quality**: Removed deprecated `GeminiService` methods and improved overall service interfaces

### Fixed

- **Async Testing**: Updated unit tests to properly handle asynchronous storage operations and service mocks
- **Linting**: Resolved formatting warnings and removed unused variable declarations
- **Type Inference**: Fixed TypeScript strict mode issues in canvas rendering logic

---

## [1.6.0] - 2026-02-01

### Added

- **IndexedDB Storage**: Migrated from LocalStorage to IndexedDB (via `idb-keyval`) for:
  - 100–500+ MB storage capacity (vs. 5–10 MB with LocalStorage)
  - Durable persistence of custom templates and meme states
  - Improved performance for large datasets
- **Developer Documentation**: Added `docs/DEV_GUIDE.md` with development setup, coding standards, and project-specific best practices

### Changed

- **CORS Whitelist**: Expanded backend proxy whitelist to support additional meme template providers:
  - Imgflip
  - Giphy
  - Unsplash
  - Reddit
  - Meme-specific CDNs
- **Mobile UI**: Optimized `MemeEditorComponent` layout for mobile devices with improved touch controls and reduced viewport constraints

### Fixed

- **Build Errors**: Fixed NG5002 errors related to type assertions and `@empty` block syntax affecting production builds
- **Documentation**: Updated `README.md` and related guides to reflect storage architecture changes
- **Storage Migration**: Added backward compatibility layer for existing LocalStorage data

### Migration Guide

Users upgrading from v1.5.0 will automatically migrate their saved memes to IndexedDB on first load. No action required.

---

## [1.5.0] - 2026-01-13

### Added

- **Environment Configuration**:
  - New `environment.prod.ts` for production builds
  - Angular CLI file replacement strategy for build-time configuration
  - `GEMINI_API_KEY` environment variable support
- **Backend Proxy Server** (`server/` directory):
  - Express.js server for secure Gemini API communication
  - `/api/generate-captions-from-image` – AI captions from uploaded images
  - `/api/generate-captions-from-text` – AI captions from template names
  - `/api/template-image?url=...` – CORS-safe proxy for external meme templates
- **Development Proxy**: `proxy.conf.json` configuration for transparent `/api` routing in dev mode

### Changed

- **Validation Tightened**:
  - Strict MIME type validation (JPG, PNG, GIF, WebP only)
  - Max file size enforcement (`MEME_CONSTANTS.MAX_FILE_SIZE`)
  - Layer limit enforcement (`MEME_CONSTANTS.MAX_LAYERS`)
- **Clipboard Support**: Enhanced `copyMemeToClipboard()` with better browser compatibility and clearer error messages
- **Template Loading**: Default meme templates now load via backend proxy to avoid CORS issues

### Fixed

- **Image Upload**: Resolved file type detection issues on different browsers
- **Proxy Configuration**: Fixed proxy.conf.json routing to correctly target backend

### Breaking Changes

- **API Key Location**: Moved from client-side `environment.ts` to backend-only `.env` file for security. See [Migration Guide](docs/MIGRATION_1.5.0.md).

### Migration Guide

Existing `environment.ts` API key references must be removed. Update your `.env` file with your `GEMINI_API_KEY`.

---

## [1.4.0] - 2026-01-13

### Changed

- **Project Structure**: Reorganized application code under `src/app/` following Angular conventions:
  - `src/app/components/` – Angular components
  - `src/app/services/` – Shared services
  - `src/app/models/` – TypeScript interfaces and types
  - `src/app/utils/` – Utility functions
- **Bootstrap & Imports**: Updated application bootstrap entry point and all service/component imports to reflect new structure
- **TypeScript Configuration**: Updated `tsconfig.json` to include new directory paths

### Fixed

- **Build Issues**: Resolved import path errors from old flat structure
- **Module Resolution**: Fixed TypeScript module resolution for new directory layout

---

## [1.3.0] - 2026-01-12

### Added

- **Code Quality Tooling**:
  - ESLint configuration for TypeScript linting
  - Prettier configuration for consistent code formatting
  - `npm run lint` – Run ESLint checks
  - `npm run format` – Auto-format code with Prettier
- **Documentation**: Clear `environment.apiKey` placeholder and setup instructions

### Changed

- **Angular Configuration**: Updated `angular.json` to correctly reference entry points and asset directories
- **Template Bindings**: Refined meme-editor component template to work with Angular Signals and avoid invalid ngModel assignments

### Fixed

- **Import Paths**: Corrected relative import paths in `app.component.ts` and `gemini.service.ts`
- **Asset Configuration**: Added `src/assets/` directory and `src/favicon.ico` placeholder
- **Angular Compatibility**: Updated template syntax for Angular 21 compatibility

---

## [1.2.0] - 2026-01-12

### Added

- **Service Architecture**:
  - `ImageService` – Image processing and canvas rendering logic
  - `StorageService` – LocalStorage management for saved memes and templates
  - `AiCaptionService` – Unified AI caption generation (renamed from `GeminiService`)
- **Modular Project Structure**:
  - `core/` – Services and singleton providers
  - `features/` – Feature-specific components and logic
  - `shared/` – Shared utilities, models, and constants

### Changed

- **MemeEditorComponent**: Refactored to delegate business logic to new services, improving testability and maintainability
- **Code Organization**: Improved overall code organization and scalability for future feature additions
- **Service Naming**: `GeminiService` renamed to `AiCaptionService` for better clarity on purpose

### Removed

- Inline logic from components now delegated to services

---

## [1.1.0] - 2026-01-11

### Added

- **Type Safety Improvements**:
  - Replaced all `any` types with proper TypeScript interfaces
  - Created `SavedMemeState`, `TextLayer`, and other domain models
  - Full strict mode TypeScript compilation
- **Interface Alignment**: Updated `SavedMemeState` to include `version`, `dimensions`, and `timestamp` fields
- **Constants System**: Centralized `MEME_CONSTANTS` for file sizes, layer limits, and quality settings
- **Backward Compatibility**: Migration logic for old saved state format to new format
- **Error Handling**: Type guards and null checks throughout service layer

### Changed

- **Type Safety**: All service methods now use proper types instead of `any`
- **Template Binding**: Replaced `$any()` type casting with proper TypeScript types
- **Null Safety**: Removed all non-null assertions (`!`) and added proper null checks
- **Environment Configuration**: Updated `environment.ts` with clearer inline documentation
- **File Size Validation**: Centralized to use `MEME_CONSTANTS.MAX_FILE_SIZE`

### Fixed

- **SavedMemeState Mismatch**: Interface now matches model definition with all required fields
- **TypeScript Errors**: Fixed all strict mode errors in gemini.service.ts and components
- **Template Type Casting**: Removed unsafe type assertions
- **Error Object Handling**: Fixed error handling to check error types before property access

---

## [1.0.1] - 2026-01-11

### Fixed

- **Code Cleanup**:
  - Removed unused imports (`takeUntilDestroyed`, `debounceTime`, `distinctUntilChanged`)
  - Removed unused `DestroyRef` injection and unnecessary effects
  - Removed unused variable declarations
- **Type Safety**: Updated components to use `ImageFilter` and `CaptionTone` enums instead of string literals
- **Configuration**: Created missing `environment.ts` file for API key configuration
- **Filter Mapping**: Updated to use `IMAGE_FILTER_CSS_MAP` from model instead of duplicate definitions

### Changed

- **Enum Usage**: All filter and tone selections now use proper enum values

---

## [1.0.0] - 2026-01-11

### Added

#### User Features

- **Image Handling**:
  - Upload custom images (JPG, PNG, GIF, WebP) up to 10MB
  - Select from 13+ popular meme templates (Distracted Boyfriend, Drake, Loss, etc.)
  - Save uploaded images as reusable custom templates
  - Real-time template search and filtering
- **AI Caption Generation**:
  - Google Gemini API integration for intelligent captions
  - Multiple tone options: Humorous, Sarcastic, Wholesome, Absurd, Dark, Professional, Poetic
  - Context field for guiding AI suggestions
  - One-click magic caption generation
- **Text Editing**:
  - Unlimited text layers per meme
  - Per-layer styling: font size (10–200px), color, outline, blur, vertical position
  - Layer reordering and management
  - Real-time preview
- **Image Processing**:
  - Filters: Grayscale, Sepia, Invert, Blur, Brightness, Contrast
  - Canvas-based rendering for quality output
- **Export & Sharing**:
  - Download as high-quality JPEG with quality options (95%, 92%, 75%, 50%)
  - Copy meme directly to clipboard for quick sharing
  - Cross-browser compatibility
- **Session Management**:
  - Save complete meme state to LocalStorage
  - Load previous work with one click
  - Auto-recovery on page refresh

#### Technical Features

- Angular 21 with Signals-based reactive state management
- TypeScript 5.8 with strict mode
- Tailwind CSS for responsive, modern UI
- Canvas API for meme rendering
- LocalStorage for persistence
- CORS-safe image handling
- Comprehensive error handling
- Accessibility features (ARIA labels, keyboard navigation)

---

## Version Timeline

| Version | Date       | Focus                                          |
| ------- | ---------- | ---------------------------------------------- |
| 1.11.0  | 2026-09-05 | Playwright E2E, Bug fixes, Dependency upgrades |
| 1.10.0  | 2026-07-02 | Dark Mode, Type Safety, Security updates       |
| 1.9.1   | 2026-05-31 | Dependency updates, test improvements          |
| 1.9.0   | 2026-03-15 | Premium typography, improved testing           |
| 1.8.0   | 2026-03-05 | Export service, UX polish                      |
| 1.7.0   | 2026-02-15 | Canvas refactor, async storage                 |
| 1.6.0   | 2026-02-01 | IndexedDB migration, mobile optimization       |
| 1.5.0   | 2026-01-13 | Backend proxy, production setup                |
| 1.4.0   | 2026-01-13 | Project restructuring                          |
| 1.3.0   | 2026-01-12 | Tooling (ESLint, Prettier)                     |
| 1.2.0   | 2026-01-12 | Service architecture                           |
| 1.1.0   | 2026-01-11 | Type safety improvements                       |
| 1.0.1   | 2026-01-11 | Bug fixes, cleanup                             |
| 1.0.0   | 2026-01-11 | Initial release                                |

---

## Upgrade Guide

- **1.5.0 → 1.6.0**: Automatic IndexedDB migration, no action required
- **1.4.0 → 1.5.0**: Move API key from `environment.ts` to backend `.env`
- **Earlier versions**: See individual migration guides in `docs/migrations/`

---

## Release Policy

- **Breaking Changes**: Bumped in MAJOR version (e.g., 1.x.x → 2.0.0)
- **New Features**: Bumped in MINOR version (e.g., 1.9.0 → 1.10.0)
- **Bug Fixes**: Bumped in PATCH version (e.g., 1.9.0 → 1.9.1)

For more information, see [Semantic Versioning](https://semver.org/).
