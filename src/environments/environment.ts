// environment.ts
// This file is for local/development configuration.
// In production, it should be replaced by environment.prod.ts via file replacement.

export const environment = {
  production: false,

  /**
   * Gemini API key.
   *
   * Do NOT hard-code real secrets here for production builds.
   * For production, configure this value via a separate environment.prod.ts
   * or an injected configuration mechanism at build/deploy time.
   */
  // TODO: Replace this placeholder with your real Gemini API key for production use.
  apiKey: 'YOUR_GEMINI_API_KEY_HERE',
};
