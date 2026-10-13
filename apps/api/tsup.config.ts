import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // The shared package ships TypeScript sources: bundle it, keep real npm dependencies external.
  noExternal: ['@canadex/shared'],
});
