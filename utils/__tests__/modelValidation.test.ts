import { describe, it, expect } from 'vitest';
import {
  validateModelConfig,
  getModelById,
  getDefaultModel,
  isValidModelId,
  getAllModelIds,
} from '../modelValidation';
import type { ModelConfig } from '../../constants/modelRegistry';

describe('validateModelConfig', () => {
  const validConfig: ModelConfig = {
    id: 'test-model',
    name: 'Test Model',
    dimensions: 768,
    huggingFaceId: 'Xenova/test-model',
    description: 'A test model',
    defaultParams: {
      pooling: 'mean',
      normalize: true,
    },
  };

  it('should accept a valid model config', () => {
    expect(() => validateModelConfig(validConfig)).not.toThrow();
    const result = validateModelConfig(validConfig);
    expect(result).toEqual(validConfig);
  });

  it('should reject non-object config', () => {
    expect(() => validateModelConfig(null)).toThrow('must be an object');
    expect(() => validateModelConfig('string')).toThrow('must be an object');
    expect(() => validateModelConfig(123)).toThrow('must be an object');
  });

  it('should reject config with missing id', () => {
    const noId = {
      name: 'Test Model',
      dimensions: 768,
      huggingFaceId: 'Xenova/test-model',
      description: 'A test model',
    };
    expect(() => validateModelConfig(noId)).toThrow('must have a non-empty string id');
  });

  it('should reject config with empty id', () => {
    const emptyId = { ...validConfig, id: '' };
    expect(() => validateModelConfig(emptyId)).toThrow('must have a non-empty string id');
  });

  it('should reject config with missing name', () => {
    const noName = {
      id: 'test-model',
      dimensions: 768,
      huggingFaceId: 'Xenova/test-model',
      description: 'A test model',
    };
    expect(() => validateModelConfig(noName)).toThrow('must have a non-empty string name');
  });

  it('should reject config with invalid dimensions', () => {
    expect(() => validateModelConfig({ ...validConfig, dimensions: -1 })).toThrow(
      'positive integer'
    );
    expect(() => validateModelConfig({ ...validConfig, dimensions: 0 })).toThrow(
      'positive integer'
    );
    expect(() => validateModelConfig({ ...validConfig, dimensions: 3.14 })).toThrow(
      'positive integer'
    );
  });

  it('should reject config with missing huggingFaceId', () => {
    const noHfId = {
      id: 'test-model',
      name: 'Test Model',
      dimensions: 768,
      description: 'A test model',
    };
    expect(() => validateModelConfig(noHfId)).toThrow('must have a non-empty string huggingFaceId');
  });

  it('should reject config with missing description', () => {
    const noDesc = {
      id: 'test-model',
      name: 'Test Model',
      dimensions: 768,
      huggingFaceId: 'Xenova/test-model',
    };
    expect(() => validateModelConfig(noDesc)).toThrow('must have a non-empty string description');
  });

  it('should accept config without defaultParams', () => {
    const noParams = {
      id: 'test-model',
      name: 'Test Model',
      dimensions: 768,
      huggingFaceId: 'Xenova/test-model',
      description: 'A test model',
    };
    expect(() => validateModelConfig(noParams)).not.toThrow();
  });

  it('should reject config with invalid pooling', () => {
    const invalidPooling = {
      ...validConfig,
      defaultParams: { pooling: 'invalid', normalize: true },
    };
    expect(() => validateModelConfig(invalidPooling)).toThrow('must be "mean" or "cls"');
  });

  it('should reject config with invalid normalize', () => {
    const invalidNormalize = {
      ...validConfig,
      defaultParams: { pooling: 'mean', normalize: 'yes' },
    };
    expect(() => validateModelConfig(invalidNormalize)).toThrow('must be a boolean');
  });
});

describe('getModelById', () => {
  it('should return model for valid ID', () => {
    const model = getModelById('all-minilm-l6-v2');
    expect(model).toBeDefined();
    expect(model.id).toBe('all-minilm-l6-v2');
  });

  it('should throw error for invalid ID', () => {
    expect(() => getModelById('nonexistent-model')).toThrow('not found in registry');
  });

  it('should include available models in error message', () => {
    try {
      getModelById('invalid-id');
    } catch (error) {
      expect((error as Error).message).toContain('Available:');
      expect((error as Error).message).toContain('all-minilm-l6-v2');
    }
  });
});

describe('getDefaultModel', () => {
  it('should return a valid model', () => {
    const model = getDefaultModel();
    expect(model).toBeDefined();
    expect(model.id).toBeDefined();
    expect(model.name).toBeDefined();
    expect(model.dimensions).toBeGreaterThan(0);
  });

  it('should return all-minilm-l6-v2 as default', () => {
    const model = getDefaultModel();
    expect(model.id).toBe('all-minilm-l6-v2');
  });
});

describe('isValidModelId', () => {
  it('should return true for valid model ID', () => {
    expect(isValidModelId('all-minilm-l6-v2')).toBe(true);
  });

  it('should return false for invalid model ID', () => {
    expect(isValidModelId('nonexistent-model')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidModelId('')).toBe(false);
  });
});

describe('getAllModelIds', () => {
  it('should return an array of model IDs', () => {
    const ids = getAllModelIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('should include all-minilm-l6-v2', () => {
    const ids = getAllModelIds();
    expect(ids).toContain('all-minilm-l6-v2');
  });

  it('should return all keys from MODEL_REGISTRY', () => {
    const ids = getAllModelIds();
    expect(ids.length).toBe(1); // Slice 5: single model
  });
});
