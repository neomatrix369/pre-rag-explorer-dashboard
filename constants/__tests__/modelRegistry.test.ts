import { describe, it, expect } from 'vitest';
import { MODEL_REGISTRY, DEFAULT_MODEL_ID, type ModelConfig } from '../modelRegistry';

describe('MODEL_REGISTRY', () => {
  it('should contain at least one model', () => {
    const modelIds = Object.keys(MODEL_REGISTRY);
    expect(modelIds.length).toBeGreaterThan(0);
  });

  it('should have a valid default model ID', () => {
    expect(DEFAULT_MODEL_ID).toBeDefined();
    expect(typeof DEFAULT_MODEL_ID).toBe('string');
    expect(DEFAULT_MODEL_ID in MODEL_REGISTRY).toBe(true);
  });

  it('should have all-minilm-l6-v2 model', () => {
    const model = MODEL_REGISTRY['all-minilm-l6-v2'];
    expect(model).toBeDefined();
    expect(model.id).toBe('all-minilm-l6-v2');
    expect(model.name).toBe('all-MiniLM-L6-v2');
    expect(model.huggingFaceId).toBe('Xenova/all-MiniLM-L6-v2');
  });

  it('should have all required fields for each model', () => {
    Object.values(MODEL_REGISTRY).forEach((model: ModelConfig) => {
      expect(model.id).toBeDefined();
      expect(typeof model.id).toBe('string');
      expect(model.id.trim()).not.toBe('');

      expect(model.name).toBeDefined();
      expect(typeof model.name).toBe('string');
      expect(model.name.trim()).not.toBe('');

      expect(model.dimensions).toBeDefined();
      expect(typeof model.dimensions).toBe('number');
      expect(model.dimensions).toBeGreaterThan(0);
      expect(Number.isInteger(model.dimensions)).toBe(true);

      expect(model.huggingFaceId).toBeDefined();
      expect(typeof model.huggingFaceId).toBe('string');
      expect(model.huggingFaceId.trim()).not.toBe('');

      expect(model.description).toBeDefined();
      expect(typeof model.description).toBe('string');
      expect(model.description.trim()).not.toBe('');
    });
  });

  it('should have valid default params for all-minilm-l6-v2', () => {
    const model = MODEL_REGISTRY['all-minilm-l6-v2'];
    expect(model.defaultParams).toBeDefined();
    expect(model.defaultParams?.pooling).toBe('mean');
    expect(model.defaultParams?.normalize).toBe(true);
  });

  it('should have 384 dimensions for all-minilm-l6-v2', () => {
    const model = MODEL_REGISTRY['all-minilm-l6-v2'];
    expect(model.dimensions).toBe(384);
  });

  it('should have HuggingFace ID starting with Xenova/', () => {
    Object.values(MODEL_REGISTRY).forEach((model: ModelConfig) => {
      expect(model.huggingFaceId).toMatch(/^Xenova\//);
    });
  });
});
