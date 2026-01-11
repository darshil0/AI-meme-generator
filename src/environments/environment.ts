// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiKey: process.env['NG_APP_GEMINI_API_KEY'] || '', // Set your Gemini API key here or via environment variable
};
