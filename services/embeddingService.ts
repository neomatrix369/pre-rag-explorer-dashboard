import { pipeline, env, type PipelineType } from '@xenova/transformers';
import { GEMINI_MODEL } from '../constants';

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
 * Singleton class to manage the Transformers.js pipeline.
 * This ensures we only download/load the model once.
 */
class EmbeddingPipeline {
  static task: PipelineType = 'feature-extraction';
  static model = GEMINI_MODEL;
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(): Promise<FeatureExtractionPipeline> {
    if (this.instance === null) {
      // Feature extraction pipeline with specific model
      this.instance = (await pipeline(this.task, this.model)) as FeatureExtractionPipeline;
    }
    return this.instance;
  }
}

/**
 * Generates embeddings for a list of strings using the local browser model.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const extractor = await EmbeddingPipeline.getInstance();
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
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('Invalid query text');
  }

  try {
    const extractor = await EmbeddingPipeline.getInstance();
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  } catch (err: unknown) {
    console.error('Query embedding failed', err);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to generate local query embedding: ${message}`);
  }
}
