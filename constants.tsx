/* eslint-disable react-refresh/only-export-components */
// This file exports both constants and Icon components, which is intentional
import React from 'react';
<<<<<<< feat/slice-05-06-model-registry
import { ChunkingMethod, EmbeddingModelConfig } from './types';

// ============================================================================
// MODEL REGISTRY
// ============================================================================

export const MODEL_REGISTRY: Record<string, EmbeddingModelConfig> = {
  'Xenova/all-MiniLM-L6-v2': {
    id: 'Xenova/all-MiniLM-L6-v2',
    name: 'MiniLM L6 v2',
    family: 'MiniLM',
    dimensions: 384,
    sizeMB: 23,
    multilingual: false,
    description: 'Fast, lightweight sentence transformer for English',
  },
  'Xenova/bge-small-en-v1.5': {
    id: 'Xenova/bge-small-en-v1.5',
    name: 'BGE Small EN v1.5',
    family: 'BGE',
    dimensions: 384,
    sizeMB: 33,
    multilingual: false,
    description: 'BAAI embedding model optimized for retrieval tasks',
  },
};

// Default model (backward compatibility)
export const DEFAULT_MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

// Legacy constants (deprecated, use MODEL_REGISTRY)
export const GEMINI_MODEL = DEFAULT_MODEL_ID;
// eslint-disable-next-line security/detect-object-injection -- Safe: DEFAULT_MODEL_ID is a known constant
export const EMBEDDING_DIMENSIONS = MODEL_REGISTRY[DEFAULT_MODEL_ID].dimensions;
=======
import { ChunkingMethod } from './types';
import { getDefaultModel } from './utils/modelValidation';

// Re-export model constants from registry
// This maintains backward compatibility while using centralized MODEL_REGISTRY
const defaultModel = getDefaultModel();
export const GEMINI_MODEL = defaultModel.huggingFaceId;
export const EMBEDDING_DIMENSIONS = defaultModel.dimensions;
>>>>>>> main

// eslint-disable-next-line react-refresh/only-export-components
export const CHUNKING_METHOD_LABELS: Record<ChunkingMethod, string> = {
  [ChunkingMethod.FIXED]: 'fixed (Fixed-size)',
  [ChunkingMethod.RECURSIVE]: 'recursive (Recursive Character)',
  [ChunkingMethod.TOKEN]: 'token (Token-Based)',
  [ChunkingMethod.SENTENCE]: 'sentence (Sentence-Based)',
  [ChunkingMethod.SEMANTIC]: 'semantic (Semantic Grouping)',
};

// eslint-disable-next-line react-refresh/only-export-components
export const Icons = {
  Upload: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Database: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Cog: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  CheckCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
};
