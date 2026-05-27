/**
 * Import smoke (Gate B) — every production service module loads without side-effect errors.
 * Pattern from price-analysis/tests/test_import_smoke.py and rag-params-finder check_integrity.
 */
import { describe, expect, it } from 'vitest';

const SERVICE_MODULES = [
  '@/services/chunkingService',
  '@/services/embeddingService',
  '@/services/fileParser',
  '@/services/vectorStore',
  '@/utils/modelValidation',
  '@/constants/modelRegistry',
] as const;

describe('importSmoke', () => {
  it.each(SERVICE_MODULES)('loads module %s', async (modulePath) => {
    const loaded = await import(modulePath);
    expect(loaded).toBeDefined();
  });
});
