import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCollection,
  getAllCollections,
  deleteCollection,
  clearAllCollections,
  saveFile,
  getAllFiles,
  deleteFile,
  clearAllFiles,
} from '../vectorStore';
import { VectorCollection, UploadedFile, ChunkingMethod } from '../../types';

// Mock VectorCollection factory
function createMockCollection(id: string, name: string): VectorCollection {
  return {
    id,
    name,
    chunkMethod: ChunkingMethod.FIXED,
    sourceFileId: 'file-123',
    sourceFileName: 'test.txt',
    chunkCount: 3,
    params: { chunkSize: 500, overlap: 100 },
    createdAt: new Date().toISOString(),
    chunks: [
      {
        id: `chunk-${id}-1`,
        text: 'First chunk',
        index: 0,
        sourceFileId: 'file-123',
        sourceFileName: 'test.txt',
        chunkMethod: ChunkingMethod.FIXED,
        metadata: {},
      },
    ],
    vectors: [[0.1, 0.2, 0.3]],
    embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  };
}

// Mock UploadedFile factory
function createMockFile(id: string, name: string): UploadedFile {
  return {
    id,
    name,
    type: 'text',
    size: 1234,
    content: 'Sample file content',
    uploadedAt: new Date().toISOString(),
  };
}

describe('vectorStore', () => {
  beforeEach(async () => {
    // Clear all data before each test to ensure isolation
    await clearAllCollections();
    await clearAllFiles();
  });

  describe('collection operations', () => {
    it('should save and retrieve a collection', async () => {
      const collection = createMockCollection('col-1', 'Test Collection');
      await saveCollection(collection);

      const collections = await getAllCollections();
      expect(collections).toHaveLength(1);
      expect(collections[0].id).toBe('col-1');
      expect(collections[0].name).toBe('Test Collection');
    });

    it('should save multiple collections', async () => {
      const col1 = createMockCollection('col-1', 'Collection 1');
      const col2 = createMockCollection('col-2', 'Collection 2');

      await saveCollection(col1);
      await saveCollection(col2);

      const collections = await getAllCollections();
      expect(collections).toHaveLength(2);
      expect(collections.map((c) => c.id)).toContain('col-1');
      expect(collections.map((c) => c.id)).toContain('col-2');
    });

    it('should update existing collection with same id', async () => {
      const collection = createMockCollection('col-1', 'Original Name');
      await saveCollection(collection);

      const updated = { ...collection, name: 'Updated Name' };
      await saveCollection(updated);

      const collections = await getAllCollections();
      expect(collections).toHaveLength(1);
      expect(collections[0].name).toBe('Updated Name');
    });

    it('should delete a collection', async () => {
      const col1 = createMockCollection('col-1', 'Collection 1');
      const col2 = createMockCollection('col-2', 'Collection 2');

      await saveCollection(col1);
      await saveCollection(col2);
      await deleteCollection('col-1');

      const collections = await getAllCollections();
      expect(collections).toHaveLength(1);
      expect(collections[0].id).toBe('col-2');
    });

    it('should clear all collections', async () => {
      await saveCollection(createMockCollection('col-1', 'Collection 1'));
      await saveCollection(createMockCollection('col-2', 'Collection 2'));
      await saveCollection(createMockCollection('col-3', 'Collection 3'));

      await clearAllCollections();

      const collections = await getAllCollections();
      expect(collections).toHaveLength(0);
    });

    it('should return empty array when no collections exist', async () => {
      const collections = await getAllCollections();
      expect(collections).toEqual([]);
    });
  });

  describe('file operations', () => {
    it('should save and retrieve a file', async () => {
      const file = createMockFile('file-1', 'test.txt');
      await saveFile(file);

      const files = await getAllFiles();
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe('file-1');
      expect(files[0].name).toBe('test.txt');
      expect(files[0].content).toBe('Sample file content');
    });

    it('should save multiple files', async () => {
      const file1 = createMockFile('file-1', 'test1.txt');
      const file2 = createMockFile('file-2', 'test2.csv');

      await saveFile(file1);
      await saveFile(file2);

      const files = await getAllFiles();
      expect(files).toHaveLength(2);
      expect(files.map((f) => f.id)).toContain('file-1');
      expect(files.map((f) => f.id)).toContain('file-2');
    });

    it('should update existing file with same id', async () => {
      const file = createMockFile('file-1', 'original.txt');
      await saveFile(file);

      const updated = { ...file, name: 'updated.txt', content: 'New content' };
      await saveFile(updated);

      const files = await getAllFiles();
      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('updated.txt');
      expect(files[0].content).toBe('New content');
    });

    it('should delete a file', async () => {
      const file1 = createMockFile('file-1', 'test1.txt');
      const file2 = createMockFile('file-2', 'test2.txt');

      await saveFile(file1);
      await saveFile(file2);
      await deleteFile('file-1');

      const files = await getAllFiles();
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe('file-2');
    });

    it('should clear all files', async () => {
      await saveFile(createMockFile('file-1', 'test1.txt'));
      await saveFile(createMockFile('file-2', 'test2.txt'));
      await saveFile(createMockFile('file-3', 'test3.txt'));

      await clearAllFiles();

      const files = await getAllFiles();
      expect(files).toHaveLength(0);
    });

    it('should return empty array when no files exist', async () => {
      const files = await getAllFiles();
      expect(files).toEqual([]);
    });
  });

  describe('isolation between stores', () => {
    it('should keep collections and files separate', async () => {
      const collection = createMockCollection('col-1', 'Test Collection');
      const file = createMockFile('file-1', 'test.txt');

      await saveCollection(collection);
      await saveFile(file);

      const collections = await getAllCollections();
      const files = await getAllFiles();

      expect(collections).toHaveLength(1);
      expect(files).toHaveLength(1);

      // Clearing files should not affect collections
      await clearAllFiles();
      const remainingCollections = await getAllCollections();
      expect(remainingCollections).toHaveLength(1);
    });
  });
});
