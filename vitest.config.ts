import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    server: {
      deps: {
        // Apply resolve.alias to CJS requires inside transformers (sharp stub).
        inline: ['@xenova/transformers', 'sharp'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['services/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules'],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      // transformers imports sharp at load time; stub in tests (browser-only runtime).
      sharp: path.resolve(__dirname, './src/tests/sharp-stub.ts'),
    },
  },
});
