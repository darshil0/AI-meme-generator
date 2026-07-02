# Lessons Learned

## Project: AI Meme Generator

### Initial Patterns

- [2026-01-11] Implemented strict TypeScript compliance and domain models to eliminate `any` types.
- [2026-01-13] Introduced Backend Proxy server to secure Gemini API keys and handle CORS for external image templates.
- [2026-01-13] Standardized API communication using shared `api-types.ts` interfaces across frontend and backend.
- [2026-02-01] Migrated from LocalStorage to IndexedDB (via `idb-keyval`) for increased storage capacity and better performance.
- [2026-03-05] Adopted new Workflow Orchestration rules provided by the user.
- [2026-03-05] Tech stack identified: Angular 21 (Signals/Zoneless), @google/genai, Playwright, Vitest.
- [2026-03-05] Implemented `CanvasUtils` for centralized meme rendering.
- [2026-07-02] Implemented dark mode with Angular Signals and IndexedDB persistence.
- [2026-07-02] Hardened type safety by removing 'any' casts in critical paths (Gemini client, state management).

### Mistakes & Corrections

- [2026-01-13] Resolved CORS issues with external meme templates by implementing a backend image proxy.
- [2026-02-01] Fixed NG5002 build errors in production by correcting type assertions and `@empty` block syntax in Angular templates.
- [2026-03-05] Corrected scoping bug in backend error handling where destructured variables were used in the `catch` block without proper access.
- [2026-03-05] Fixed CRLF vs LF formatting issues in Angular components using `npm run format`.
- [2026-05-31] Fixed frontend test failures by adding the `canvas` dependency to mock `HTMLCanvasElement.toDataURL()` in JSDOM.
- [2026-07-02] Resolved `@google/genai` SDK response structure mismatch in backend tests and client code.
- [2026-07-02] Fixed ESLint v10 peer dependency conflicts by pinning `@angular/compiler-cli` versions.
