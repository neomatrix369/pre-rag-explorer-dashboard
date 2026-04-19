import { describe, it, expect } from 'vitest';
import { chunkText } from './chunkingService';
import { ChunkingMethod } from '../types';

describe('chunkingService', () => {
  describe('fixedSizeChunk', () => {
    it('should return empty array for empty input', async () => {
      const result = await chunkText('', ChunkingMethod.FIXED, {});
      expect(result.chunks).toEqual([]);
      expect(result.stats.count).toBe(0);
    });

    it('should chunk text with default params', async () => {
      const text = 'a'.repeat(2000);
      const result = await chunkText(text, ChunkingMethod.FIXED, {});
      expect(result.chunks.length).toBeGreaterThan(1);
      expect(result.stats.count).toBeGreaterThan(1);
    });

    it('should respect custom chunk size', async () => {
      const text = 'a'.repeat(1500);
      const result = await chunkText(text, ChunkingMethod.FIXED, {
        chunkSize: 500,
        overlap: 100,
      });
      // With 1500 chars, chunkSize 500, overlap 100: should get 3-4 chunks
      expect(result.chunks.length).toBeGreaterThan(1);
      expect(result.chunks.length).toBeLessThanOrEqual(4);
    });
  });
});
