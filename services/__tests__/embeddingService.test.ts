import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmbeddings, generateQueryEmbedding } from '../embeddingService';

// Mock @xenova/transformers to avoid loading the 23MB model in tests
vi.mock('@xenova/transformers', () => {
  const mockPipeline = vi.fn(async () => {
    return async (_text: string) => {
      // Return a mock 384-dimensional embedding (matching all-MiniLM-L6-v2 output)
      const dim = 384;
      const mockEmbedding = new Float32Array(dim).fill(0.1);
      return { data: mockEmbedding };
    };
  });

  return {
    pipeline: mockPipeline,
    env: {
      allowLocalModels: false,
      useBrowserCache: true,
    },
  };
});

describe('embeddingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateEmbeddings', () => {
    it('should return empty array for empty input', async () => {
      const result = await generateEmbeddings([]);
      expect(result).toEqual([]);
    });

    it('should generate embeddings for single text', async () => {
      const result = await generateEmbeddings(['hello world']);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Array);
      expect(result[0]).toHaveLength(384); // all-MiniLM-L6-v2 dimension
    });

    it('should generate embeddings for multiple texts', async () => {
      const texts = ['first text', 'second text', 'third text'];
      const result = await generateEmbeddings(texts);
      expect(result).toHaveLength(3);
      result.forEach((embedding) => {
        expect(embedding).toBeInstanceOf(Array);
        expect(embedding).toHaveLength(384);
      });
    });

    it('should sanitize empty strings to single space', async () => {
      const texts = ['valid text', '', '   ', 'another valid'];
      const result = await generateEmbeddings(texts);
      expect(result).toHaveLength(4);
      // All should return valid embeddings (empty strings converted to space)
      result.forEach((embedding) => {
        expect(embedding).toHaveLength(384);
      });
    });

    it('should handle non-string inputs gracefully', async () => {
      const texts = ['valid', null as unknown as string, undefined as unknown as string];
      const result = await generateEmbeddings(texts);
      expect(result).toHaveLength(3);
      // Null/undefined should be sanitized to space
      result.forEach((embedding) => {
        expect(embedding).toHaveLength(384);
      });
    });
  });

  describe('generateQueryEmbedding', () => {
    it('should generate embedding for valid query', async () => {
      const result = await generateQueryEmbedding('what is RAG?');
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(384);
    });

    it('should throw error for empty query', async () => {
      await expect(generateQueryEmbedding('')).rejects.toThrow('Invalid query text');
    });

    it('should throw error for whitespace-only query', async () => {
      await expect(generateQueryEmbedding('   ')).rejects.toThrow('Invalid query text');
    });

    it('should throw error for null query', async () => {
      await expect(generateQueryEmbedding(null as unknown as string)).rejects.toThrow(
        'Invalid query text'
      );
    });

    it('should throw error for undefined query', async () => {
      await expect(generateQueryEmbedding(undefined as unknown as string)).rejects.toThrow(
        'Invalid query text'
      );
    });
  });
});
