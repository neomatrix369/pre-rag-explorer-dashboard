import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend matchers
expect.extend({});
