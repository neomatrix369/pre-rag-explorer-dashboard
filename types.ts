
export type FileType = 'text' | 'csv' | 'pdf' | 'markdown';

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
  SEMANTIC = 'semantic'
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
  metadata: Record<string, any>;
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
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
  retrievalMethod: 'dense' | 'sparse' | 'hybrid';
  collectionName: string;
  collectionId: string;
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
