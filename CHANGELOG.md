# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.0] - 2026-01-25

### Added
- **Configuration Check**: Added a new `/api/config-status` endpoint to the backend to securely report if the Gemini API key is configured.
- **Startup Validation**: The frontend now verifies backend configuration on initialization and updates the UI accordingly.
- **Updated Dependencies**: Updated dependencies to the latest versions.

### Changed
- **Security Hardening**: Removed insecure `apiKey` placeholders from `environment.ts` and `environment.prod.ts`.
- **Documentation**: Updated `README.md` with secure instructions for providing the API key via the `GEMINI_API_KEY` environment variable.

### Fixed
- **Configuration Flow**: Eliminated the need for hardcoding API keys in frontend code, preventing accidental exposure of secrets.

## [1.5.0] - 2026-01-13

### Added
- **Environment Configuration**: Introduced `environment.prod.ts` and wired build tool file replacements for production builds.
- **Backend Proxy**: Added a small Express server under `server/` that:
  - Talks to the Google Gemini API using `GEMINI_API_KEY` from environment variables
  - Exposes `/api/generate-captions-from-image` and `/api/generate-captions-from-text` endpoints
  - Provides `/api/template-image?url=...` as a CORS-safe proxy for external meme templates
- **Dev Proxy**: Configured development server to use `proxy.conf.json` so `/api` calls work transparently in development.

### Changed
- **Validation**: Tightened image upload validation (strict MIME types + max file size) and enforced `MEME_CONSTANTS.MAX_LAYERS`.
- **Clipboard Support**: Hardened `copyMemeToClipboard` for better browser compatibility and clearer error messages.
- **CORS Handling**: Default meme templates now load via the backend image proxy instead of directly from external hosts.

## [1.4.0] - 2026-01-13

### Changed
- **Project Structure**: Moved core application code under `src/app` (components, models, services) to follow standard conventions.
- **Imports & TS Config**: Updated bootstrap entry, service imports, and `tsconfig.json` includes to reflect the new layout.

## [1.3.0] - 2026-01-12

### Added
- **Tooling**: Introduced ESLint and Prettier with `npm run lint` and `npm run format` scripts.
- **Config Placeholders**: Documented a clear `environment.apiKey` placeholder for Gemini configuration.

### Changed
- **Build Configuration**: Updated build configuration to match the actual entry points (`index.html`, `index.tsx`), styles, and `tsconfig`.
- **Template Bindings**: Refined `meme-editor` template bindings to correctly work with reactive state management and avoid invalid model assignments.

### Fixed
- **Import Paths**: Corrected imports in `app.component.ts` and `gemini.service.ts` to use valid relative paths.
- **Assets**: Added `src/assets/` and a placeholder `src/favicon.ico` to satisfy asset configuration.

## [1.2.0] - 2026-01-12

### Added
- **Project Structure**: Re-organized the project into `core`, `features`, and `shared` modules.
- **ImageService**: Created a dedicated service for image processing and canvas generation.
- **StorageService**: Created a dedicated service for local storage management.
- **AiCaptionService**: Renamed `GeminiService` to `AiCaptionService` to better reflect its purpose.

### Changed
- **MemeEditorComponent**: Refactored the component to delegate logic to the new services.
- **Code Organization**: Improved code organization and maintainability.
- **Scalability**: The new project structure is more scalable and easier to navigate.

## [1.1.0] - 2026-01-11

### Added
- **Type Safety Improvements**: Replaced all `any` types with proper TypeScript types
- **Interface Alignment**: SavedMemeState now matches the model definition with version, dimensions, and timestamp fields
- **Constants Usage**: Integrated MEME_CONSTANTS for file size validation and default quality settings
- **Backward Compatibility**: Added migration support for old saved state format
- **Error Handling**: Improved error handling with proper type guards and null checks

### Changed
- **Type Safety**: All service methods now use proper TypeScript types instead of `any`
- **Template Binding**: Replaced type workarounds with proper type casting in templates
- **Null Safety**: Removed all non-null assertions (`!`) and added proper null checks
- **Environment Configuration**: Updated environment.ts with clearer API key configuration comments
- **File Size Validation**: Now uses `MEME_CONSTANTS.MAX_FILE_SIZE` instead of hardcoded values
- **Default Quality**: Uses `MEME_CONSTANTS.DEFAULT_QUALITY` for consistency

### Fixed
- **Interface Mismatch**: Fixed SavedMemeState interface to include all required fields (version, dimensions, timestamp)
- **Type Errors**: Fixed all TypeScript type errors in gemini.service.ts
- **Template Type Safety**: Fixed template type casting issues
- **Error Handling**: Fixed error handling to properly check error types before accessing properties
- **Non-null Assertions**: Removed unsafe non-null assertions

## [1.0.1] - 2026-01-11

### Fixed
- **Unused Imports**: Removed unused imports (takeUntilDestroyed, debounceTime, distinctUntilChanged)
- **Enum Types**: Fixed ImageFilter and CaptionTone to use enum values instead of string literals
- **Missing Environment**: Created missing environment.ts file for API key configuration
- **Unused Code**: Removed unused DestroyRef injection and unnecessary effect

### Changed
- **Enum Usage**: Component now uses ImageFilter and CaptionTone enums from model
- **Filter Mapping**: Uses IMAGE_FILTER_CSS_MAP from model instead of duplicate definition

## [1.0.0] - 2026-01-11

### Added
- Initial release of AI Meme Generator
- Image upload functionality
- Template library with 13+ popular meme templates
- AI-powered caption generation using Google Gemini API
- Multiple caption tones (humorous, sarcastic, wholesome, absurd, dark, professional, poetic)
- Custom text layer editor with full styling options
- Image filters (grayscale, sepia, invert, blur, brightness, contrast)
- Save/Load work functionality
- Custom template creation
- Export to JPEG with quality options
- Copy to clipboard functionality
- Responsive design with Tailwind CSS
- Local storage persistence

### Technical Features
- React 18 with hooks-based state management
- TypeScript 5.8 with strict type checking
- Canvas-based meme rendering
- CORS-safe image processing
- Error handling and validation
- Accessibility features

---

## Version History

- **1.6.0**: Security hardening and backend configuration verification
- **1.5.0**: Backend proxy, validation hardening, and production environment configuration
- **1.4.0**: Restructured source into `src/app` and aligned tooling/config
- **1.3.0**: Tooling, build configuration, and template binding fixes
- **1.2.0**: Project structure re-organization and new services
- **1.1.0**: Code quality improvements, type safety enhancements
- **1.0.1**: Bug fixes and code cleanup
- **1.0.0**: Initial release
