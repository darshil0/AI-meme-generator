import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/dist/**', 'server/**', 'e2e/**'],
    globals: true,
  },
});
