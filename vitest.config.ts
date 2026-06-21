import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Pure-logic unit tests run in Node (no DOM needed). Alias mirrors vite.config.ts.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
