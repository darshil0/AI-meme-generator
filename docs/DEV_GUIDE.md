## End-to-end tests (Playwright)

The Playwright suite lives at `e2e/meme-editor.spec.ts`; Playwright's `testDir` is configured as `./e2e` in `playwright.config.ts`. It runs in Chromium and covers the landing/template picker, image upload and editor controls, image caption generation/application, save-and-restore behavior, and template-name caption fallback. The suite stubs API responses so it does not require Gemini credentials.

Install the browser once with `npx playwright install chromium`, then run all E2E tests from the repository root:

```bash
npm run test:e2e
```

The Playwright config starts both the Express backend and Angular frontend. Individual tests intercept caption and configuration endpoints; the test requiring a template-load failure intentionally exercises the app's template-name fallback.
