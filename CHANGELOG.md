# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-01-11

### Added
- **Type Safety Improvements**: Replaced all `any` types with proper TypeScript types
- **Interface Alignment**: SavedMemeState now matches the model definition with version, dimensions, and timestamp fields
- **Constants Usage**: Integrated MEME_CONSTANTS for file size validation and default quality settings
- **Backward Compatibility**: Added migration support for old saved state format
- **Error Handling**: Improved error handling with proper type guards and null checks

### Changed
- **Type Safety**: All service methods now use proper TypeScript types instead of `any`
- **Template Binding**: Replaced `$any()` with proper type casting in templates
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
- Angular 21 with Signals-based state management
- TypeScript 5.8 with strict type checking
- Canvas-based meme rendering
- CORS-safe image processing
- Error handling and validation
- Accessibility features

---

## Version History

- **1.1.0**: Code quality improvements, type safety enhancements
- **1.0.1**: Bug fixes and code cleanup
- **1.0.0**: Initial release
