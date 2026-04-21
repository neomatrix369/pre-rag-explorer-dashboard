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
  /** Embedding dimensions (e.g., 384) */
  dimensions: number;
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
    dimensions: 384,
    huggingFaceId: 'Xenova/all-MiniLM-L6-v2',
    description: 'Fast, general-purpose sentence embeddings (384 dimensions)',
    defaultParams: {
      pooling: 'mean',
      normalize: true,
    },
  },
  // Slice 6 will add: 'bge-small-en-v1.5'
};

/**
 * Default model ID used when no model is specified.
 */
export const DEFAULT_MODEL_ID = 'all-minilm-l6-v2';
