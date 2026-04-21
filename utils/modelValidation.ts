/**
 * Model Validation Utilities
 *
 * Type-safe utilities for validating and retrieving model configurations
 * from the MODEL_REGISTRY.
 */

import { MODEL_REGISTRY, DEFAULT_MODEL_ID, type ModelConfig } from '../constants/modelRegistry';

/**
 * Validates a model configuration object.
 *
 * @param config - Unknown object to validate
 * @returns Validated ModelConfig
 * @throws Error if validation fails
 */
export function validateModelConfig(config: unknown): ModelConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Model config must be an object');
  }

  const c = config as Record<string, unknown>;

  // Required fields
  if (typeof c.id !== 'string' || c.id.trim() === '') {
    throw new Error('Model config must have a non-empty string id');
  }
  if (typeof c.name !== 'string' || c.name.trim() === '') {
    throw new Error('Model config must have a non-empty string name');
  }
  if (typeof c.dimensions !== 'number' || c.dimensions <= 0 || !Number.isInteger(c.dimensions)) {
    throw new Error('Model config must have a positive integer dimensions');
  }
  if (typeof c.huggingFaceId !== 'string' || c.huggingFaceId.trim() === '') {
    throw new Error('Model config must have a non-empty string huggingFaceId');
  }
  if (typeof c.description !== 'string' || c.description.trim() === '') {
    throw new Error('Model config must have a non-empty string description');
  }

  // Optional defaultParams
  if (c.defaultParams !== undefined) {
    if (!c.defaultParams || typeof c.defaultParams !== 'object') {
      throw new Error('Model config defaultParams must be an object if provided');
    }
    const params = c.defaultParams as Record<string, unknown>;
    if (params.pooling !== undefined && params.pooling !== 'mean' && params.pooling !== 'cls') {
      throw new Error('Model config defaultParams.pooling must be "mean" or "cls"');
    }
    if (params.normalize !== undefined && typeof params.normalize !== 'boolean') {
      throw new Error('Model config defaultParams.normalize must be a boolean');
    }
  }

  return config as ModelConfig;
}

/**
 * Gets a model configuration by ID from the registry.
 *
 * @param id - Model identifier
 * @returns Model configuration
 * @throws Error if model not found
 */
export function getModelById(id: string): ModelConfig {
  // Safe: MODEL_REGISTRY is a const object with known keys
  // eslint-disable-next-line security/detect-object-injection
  const model = MODEL_REGISTRY[id];
  if (!model) {
    const available = getAllModelIds().join(', ');
    throw new Error(`Model '${id}' not found in registry. Available: ${available}`);
  }
  return model;
}

/**
 * Gets the default model configuration from the registry.
 *
 * @returns Default model configuration
 */
export function getDefaultModel(): ModelConfig {
  return getModelById(DEFAULT_MODEL_ID);
}

/**
 * Checks if a model ID exists in the registry.
 *
 * @param id - Model identifier to check
 * @returns True if model exists, false otherwise
 */
export function isValidModelId(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(MODEL_REGISTRY, id);
}

/**
 * Gets all available model IDs from the registry.
 *
 * @returns Array of model IDs
 */
export function getAllModelIds(): string[] {
  return Object.keys(MODEL_REGISTRY);
}
