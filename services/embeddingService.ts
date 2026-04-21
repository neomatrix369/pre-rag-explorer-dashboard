import { pipeline, env, type PipelineType } from '@xenova/transformers';
import { MODEL_REGISTRY, DEFAULT_MODEL_ID } from '../constants';

// Configuration to force browser execution
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Feature extraction pipeline output type.
 * The pipeline returns an object with a 'data' property containing Float32Array.
 */
type FeatureExtractionPipeline = (
  text: string,
  options: { pooling: string; normalize: boolean }
) => Promise<{ data: Float32Array }>;

/**
 * Validates that a model ID exists in the MODEL_REGISTRY.
 * @throws Error if model ID is invalid
 */
function validateModelId(modelId: string): void {
  // eslint-disable-next-line security/detect-object-injection -- Safe: validating modelId against registry keys
  if (!MODEL_REGISTRY[modelId]) {
    const validIds = Object.keys(MODEL_REGISTRY).join(', ');
    throw new Error(`Invalid model ID: "${modelId}". Valid models: ${validIds}`);
  }
}

/**
 * Singleton class to manage the Transformers.js pipeline.
 * Supports switching between registered models.
 */
class EmbeddingPipeline {
  static task: PipelineType = 'feature-extraction';
  static currentModelId: string = DEFAULT_MODEL_ID;
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(modelId: string = DEFAULT_MODEL_ID): Promise<FeatureExtractionPipeline> {
    // Validate model ID
    validateModelId(modelId);

    // If model changed, reset instance to force reload
    if (this.currentModelId !== modelId) {
      this.instance = null;
      this.currentModelId = modelId;
    }

    // Load pipeline if not cached
    if (this.instance === null) {
      this.instance = (await pipeline(this.task, modelId)) as FeatureExtractionPipeline;
    }

    return this.instance;
  }
}

/**
 * Generates embeddings for a list of strings using the local browser model.
 * @param texts - Array of text strings to embed
 * @param modelId - HuggingFace model ID from MODEL_REGISTRY (default: DEFAULT_MODEL_ID)
 */
export async function generateEmbeddings(
  texts: string[],
  modelId: string = DEFAULT_MODEL_ID
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const extractor = await EmbeddingPipeline.getInstance(modelId);
  const results: number[][] = [];

  // Sanitize inputs
  const validTexts = texts.map((t) =>
    t && typeof t === 'string' && t.trim().length > 0 ? t : ' '
  );

  // Process sequentially to avoid freezing the main thread too heavily
  for (const text of validTexts) {
    try {
      // Pooling: 'mean' averages the token vectors to get a sentence vector.
      // Normalize: true ensures the vector is unit length (good for cosine similarity).
      const output = await extractor(text, { pooling: 'mean', normalize: true });

      // output.data is a Float32Array, we convert to standard array
      results.push(Array.from(output.data as Float32Array));
    } catch (err: unknown) {
      console.error('Local embedding generation failed', err);
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to generate local embedding: ${message}`);
    }
  }

  return results;
}

/**
 * Generates an embedding for a single string (search query).
 * @param query - Text query to embed
 * @param modelId - HuggingFace model ID from MODEL_REGISTRY (default: DEFAULT_MODEL_ID)
 */
export async function generateQueryEmbedding(
  query: string,
  modelId: string = DEFAULT_MODEL_ID
): Promise<number[]> {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Invalid query text');
  }

  try {
    const extractor = await EmbeddingPipeline.getInstance(modelId);
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  } catch (err: unknown) {
    console.error('Query embedding failed', err);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to generate local query embedding: ${message}`);
  }
}
