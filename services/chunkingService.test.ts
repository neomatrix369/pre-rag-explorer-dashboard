import { describe, it, expect, vi } from 'vitest';
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

  describe('slidingWindowChunk', () => {
    it('should chunk with basic sliding window (50% overlap)', async () => {
      const text = 'a'.repeat(1000);
      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 100,
        stride: 50,
      });

      // 1000 chars, window 100, stride 50 = ~19 chunks
      expect(result.chunks.length).toBeGreaterThanOrEqual(19);
      expect(result.chunks[0].length).toBe(100);
      expect(result.stats.count).toBeGreaterThan(1);
    });

    it('should handle no overlap (stride = windowSize)', async () => {
      const text = 'a'.repeat(1000);
      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 100,
        stride: 100,
      });

      // 1000 chars, window 100, stride 100 = 10 chunks (no overlap)
      expect(result.chunks.length).toBe(10);
      expect(result.chunks[0].length).toBe(100);
    });

    it('should handle high overlap (stride = windowSize / 4)', async () => {
      const text = 'a'.repeat(400);
      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 100,
        stride: 25,
      });

      // 400 chars, window 100, stride 25 = 13 chunks (75% overlap)
      expect(result.chunks.length).toBeGreaterThanOrEqual(13);
      expect(result.chunks[0].length).toBe(100);
    });

    it('should handle stride = 1 (maximum overlap)', async () => {
      const text = 'a'.repeat(50);
      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 10,
        stride: 1,
      });

      // 50 chars, window 10, stride 1 = 41 chunks
      expect(result.chunks.length).toBeGreaterThan(40);
    });

    it('should handle stride > windowSize (creates gaps)', async () => {
      const text = 'a'.repeat(1000);
      const consoleSpy = vi.spyOn(console, 'warn');

      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 100,
        stride: 150,
      });

      // Should warn about gaps
      expect(consoleSpy).toHaveBeenCalledWith('Stride > windowSize creates gaps between chunks');

      // 1000 chars, window 100, stride 150 = 7 chunks with gaps
      expect(result.chunks.length).toBeGreaterThanOrEqual(6);

      consoleSpy.mockRestore();
    });

    it('should handle empty text', async () => {
      const result = await chunkText('', ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 100,
        stride: 50,
      });

      expect(result.chunks).toEqual([]);
      expect(result.stats.count).toBe(0);
    });

    it('should handle text shorter than window', async () => {
      const text = 'short';
      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
        windowSize: 100,
        stride: 50,
      });

      // Should return 1 chunk with the full text
      expect(result.chunks.length).toBe(1);
      expect(result.chunks[0]).toBe('short');
    });

    it('should throw error for stride <= 0', async () => {
      const text = 'a'.repeat(1000);

      await expect(
        chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
          windowSize: 100,
          stride: 0,
        })
      ).rejects.toThrow('Stride must be positive (stride > 0)');

      await expect(
        chunkText(text, ChunkingMethod.SLIDING_WINDOW, {
          windowSize: 100,
          stride: -10,
        })
      ).rejects.toThrow('Stride must be positive (stride > 0)');
    });

    it('should use default params when not specified', async () => {
      const text = 'a'.repeat(2000);
      const result = await chunkText(text, ChunkingMethod.SLIDING_WINDOW, {});

      // Default: windowSize 1000, stride 500
      // 2000 chars = 3 chunks
      expect(result.chunks.length).toBeGreaterThanOrEqual(3);
      expect(result.stats.count).toBeGreaterThan(1);
    });
  });
});
