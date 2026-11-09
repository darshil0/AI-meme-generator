# Changelog

Notable project changes, following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions. The current package version is `1.11.0`; unreleased audit work is recorded under **Unreleased** and has not been assigned a release number.

## [Unreleased]

### Security

- Restricted the template image proxy to HTTPS URLs on exact allowlisted hostnames; reject redirects, unsupported image types, requests exceeding 10 seconds, and responses over 10 MiB.
- Validate caption API field types, image MIME types, tone values, and input lengths. Image caption requests are limited to 8 MiB; context to 500 characters; template names to 100 characters. Return generic generation errors to clients.

### Fixed

- Canvas exports render text alignment, font weight, rotation, and maximum width, and fail cleanly for unavailable contexts or invalid image dimensions.
- Exposed a public editor reset action for template use, selected the first layer when restoring saved work, and made custom-template duplicate checks independent of search filtering.
- Aligned layer and filter component inputs/outputs with the editor template so layer selection and filter controls receive the expected values.

### Added

- Added Playwright E2E coverage in `e2e/meme-editor.spec.ts` for landing/template-picker rendering, upload and text/filter editing, mocked caption generation and application, saved-work restoration, and caption generation by template name when an image fails to load.

### Documentation

- Corrected setup requirements, environment configuration instructions, implemented feature descriptions, API limits, proxy behavior, and test/build commands in the README.
- Documented the exact E2E test path, coverage, browser prerequisite, and test command.
- Restored the full developer guide and documented audit behavior in `docs/CODE_AUDIT.md`.

## [1.11.0]

This is the version declared in the root and backend package manifests. The repository does not provide a release tag in the current branch to verify a release date, so no date is asserted here.

### Added

- Angular frontend and Express backend for meme editing and Gemini caption generation.
- IndexedDB persistence for custom templates, theme preference, and saved editor state.
- Canvas-based JPEG export and PNG clipboard copy.
- Vitest unit-test and Playwright test-runner configuration.

### Changed

- Frontend and backend use TypeScript 5.9; the Angular dependencies are in the 21.2 series.
- Caption generation uses the Google GenAI SDK and the `gemini-2.0-flash` model.

### Notes

- The E2E suite is located at `e2e/meme-editor.spec.ts` and is configured to run in Chromium.
- The editor currently exposes seven caption tones and seven filter choices; the backend tone enum and image-filter model define additional values not all surfaced in the UI.

---

Earlier changelog text included placeholder ellipses, unverified release dates, and claims that did not match files in the repository. Those entries have been removed rather than presented as verified release history. Consult Git history and tags for earlier changes.
