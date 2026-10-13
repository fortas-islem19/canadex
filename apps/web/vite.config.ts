import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const apiTarget = process.env.API_URL ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': apiTarget },
  },
  preview: {
    proxy: { '/api': apiTarget },
  },
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks: a content change only invalidates the small app chunk.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
            },
            {
              name: 'i18n',
              test: /node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/,
            },
            {
              name: 'forms',
              test: /node_modules[\\/](zod|react-hook-form|@hookform|@tanstack)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
