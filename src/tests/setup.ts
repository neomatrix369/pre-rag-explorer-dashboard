import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';

// @xenova/transformers loads sharp in Node; browser-only app — no native image pipeline in tests.
vi.mock('sharp', () => import('./sharp-stub'));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend matchers
expect.extend({});
