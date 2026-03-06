# Lessons Learned

## Project: AI Meme Generator

### Initial Patterns

- [2026-03-05] Adopted new Workflow Orchestration rules provided by the user.
- [2026-03-05] Tech stack identified: Angular 21, @google/genai, Playwright, Vitest.
- [2026-03-05] Implemented `CanvasUtils` for centralized meme rendering.

### Mistakes & Corrections

- [2026-03-05] Corrected scoping bug in backend error handling where destructured variables were used in the `catch` block without proper access.
- [2026-03-05] Fixed CRLF vs LF formatting issues in Angular components using `npm run format`.
