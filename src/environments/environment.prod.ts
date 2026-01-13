// environment.prod.ts
// Production configuration. Do not hard-code real secrets here for checked-in builds.

export const environment = {
  production: true,

  /**
   * Gemini API key for production.
   * Replace the placeholder at deploy time via environment-specific configuration.
   */
  apiKey: 'YOUR_GEMINI_API_KEY_HERE',
};
