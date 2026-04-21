export type FileType = 'text' | 'csv' | 'pdf' | 'markdown';

/**
 * Model identifier type.
 * Currently supports single model, will become union type in Slice 6.
 */
export type ModelId = string;

/**
 * Model configuration interface.
 * Defines metadata and parameters for embedding models.
 */
export interface ModelConfig {
  id: string;
  name: string;
  dimensions: number;
  huggingFaceId: string;
  description: string;
  defaultParams?: {
    pooling: 'mean' | 'cls';
    normalize: boolean;
  };
}

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  content: string;
  uploadedAt: string;
  progress?: number;
}

export enum ChunkingMethod {
  FIXED = 'fixed',
  RECURSIVE = 'recursive',
  TOKEN = 'token',
  SENTENCE = 'sentence',
  SEMANTIC = 'semantic',
}

export interface ChunkParams {
  chunkSize?: number;
  overlap?: number;
  tokenCount?: number;
  sentenceCount?: number;
  similarityThreshold?: number;
}

export interface Chunk {
  id: string;
  text: string;
  index: number;
  sourceFileId: string;
  sourceFileName: string;
  chunkMethod: ChunkingMethod;
  metadata: Record<string, unknown>;
}

export interface VectorCollection {
  id: string;
  name: string;
  chunkMethod: ChunkingMethod;
  sourceFileId: string;
  sourceFileName: string;
  chunkCount: number;
  params: ChunkParams;
  createdAt: string;
  chunks: Chunk[];
  vectors: number[][];
  embeddingModel?: string;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
  retrievalMethod: 'dense' | 'sparse' | 'hybrid';
  collectionName: string;
  collectionId: string;
  embeddingModel?: string;
}

export interface Experiment {
  id: string;
  timestamp: string;
  filesProcessed: string[];
  chunkMethods: ChunkingMethod[];
  params: Record<string, ChunkParams>;
  chunkCounts: Record<string, number>;
  processingTimeMs: number;
}

export interface ErrorInfo {
  message: string;
  technical?: string;
}

export interface ProcessingStatus {
  taskId: string;
  fileName: string;
  method: ChunkingMethod;
  status: 'waiting' | 'chunking' | 'vectorizing' | 'finished' | 'error';
  progress: number;
  error?: ErrorInfo;
  sampleChunks?: string[];
}

export interface AppState {
  files: UploadedFile[];
  collections: VectorCollection[];
  experiments: Experiment[];
  activeView: 'upload' | 'process' | 'search' | 'collections';
  processingStatus: ProcessingStatus[];
  globalError?: ErrorInfo;
}
