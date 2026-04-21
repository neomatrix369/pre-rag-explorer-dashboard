/**
 * Model Registry
 *
 * Centralized registry for embedding models with metadata and configuration.
 * This enables multi-model support while maintaining type safety and validation.
 */

export interface ModelConfig {
  /** Unique identifier (e.g., 'all-minilm-l6-v2') */
  id: string;
  /** Display name (e.g., 'all-MiniLM-L6-v2') */
  name: string;
  /** Model family (e.g., 'MiniLM', 'BGE') */
  family: string;
  /** Embedding dimensions (e.g., 384) */
  dimensions: number;
  /** Approximate browser model size in MB */
  sizeMB: number;
  /** Supports multiple languages */
  multilingual: boolean;
  /** HuggingFace model ID for Transformers.js (e.g., 'Xenova/all-MiniLM-L6-v2') */
  huggingFaceId: string;
  /** Human-readable description */
  description: string;
  /** Default pipeline parameters */
  defaultParams?: {
    pooling: 'mean' | 'cls';
    normalize: boolean;
  };
}

/**
 * Registry of available embedding models.
 * Each model includes metadata and default configuration.
 */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'all-minilm-l6-v2': {
    id: 'all-minilm-l6-v2',
    name: 'all-MiniLM-L6-v2',
    family: 'MiniLM',
    dimensions: 384,
    sizeMB: 23,
    multilingual: false,
    huggingFaceId: 'Xenova/all-MiniLM-L6-v2',
    description: 'Fast, general-purpose sentence embeddings (384 dimensions)',
    defaultParams: {
      pooling: 'mean',
      normalize: true,
    },
  },
  'bge-small-en-v1.5': {
    id: 'bge-small-en-v1.5',
    name: 'BGE Small EN v1.5',
    family: 'BGE',
    dimensions: 384,
    sizeMB: 33,
    multilingual: false,
    huggingFaceId: 'Xenova/bge-small-en-v1.5',
    description: 'BAAI embedding model optimized for retrieval tasks',
    defaultParams: {
      pooling: 'mean',
      normalize: true,
    },
  },
};

/**
 * Default model ID used when no model is specified.
 */
export const DEFAULT_MODEL_ID = 'all-minilm-l6-v2';
