import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // @ts-expect-error - Vite plugin type mismatch between vite and vitest
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['services/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules'],
      thresholds: {
        lines: 12,
        functions: 20,
        branches: 55,
        statements: 12,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
