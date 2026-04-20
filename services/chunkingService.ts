import { ChunkingMethod, ChunkParams } from '../types';

interface ChunkResult {
  chunks: string[];
  stats: { count: number; avgSize: number; avgTokens: number };
}

export async function chunkText(
  text: string,
  method: ChunkingMethod,
  params: ChunkParams = {}
): Promise<ChunkResult> {
  let chunks: string[] = [];

  switch (method) {
    case ChunkingMethod.FIXED:
      chunks = fixedSizeChunk(text, params.chunkSize || 1000, params.overlap || 200);
      break;
    case ChunkingMethod.RECURSIVE:
      chunks = recursiveCharacterChunk(text, params.chunkSize || 1000, params.overlap || 200);
      break;
    case ChunkingMethod.TOKEN:
      chunks = tokenBasedChunk(text, params.tokenCount || 256, params.overlap || 50);
      break;
    case ChunkingMethod.SENTENCE:
      chunks = sentenceBasedChunk(text, params.sentenceCount || 5, params.overlap || 1);
      break;
    case ChunkingMethod.SEMANTIC:
      // Note: Full semantic chunking usually requires embeddings per sentence.
      // For this prototype, we'll do a simplified version based on paragraph & structural breaks.
      chunks = semanticMockChunk(text);
      break;
  }

  const avgSize = chunks.length ? chunks.reduce((a, b) => a + b.length, 0) / chunks.length : 0;
  const avgTokens = avgSize / 4; // Roughly 4 chars per token

  return {
    chunks,
    stats: { count: chunks.length, avgSize, avgTokens },
  };
}

function fixedSizeChunk(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
    if (i >= text.length || size <= overlap) break;
  }
  return chunks;
}

function recursiveCharacterChunk(text: string, size: number, _overlap: number): string[] {
  const separators = ['\n\n', '\n', '. ', ' ', ''];

  function split(content: string, depth: number): string[] {
    if (content.length <= size || depth >= separators.length) {
      return [content];
    }
    const separator = separators[depth];
    const parts = content.split(separator);
    const result: string[] = [];
    let current = '';

    for (const part of parts) {
      if ((current + separator + part).length <= size) {
        current = current ? current + separator + part : part;
      } else {
        if (current) result.push(current);
        // Start next with overlap if possible
        current = part;
      }
    }
    if (current) result.push(current);

    // Further split any overly large pieces
    return result.flatMap((r) => (r.length > size ? split(r, depth + 1) : [r]));
  }

  return split(text, 0);
}

function tokenBasedChunk(text: string, tokenCount: number, overlap: number): string[] {
  // Approximate tokens by words or characters
  const charSize = tokenCount * 4;
  const charOverlap = overlap * 4;
  return fixedSizeChunk(text, charSize, charOverlap);
}

function sentenceBasedChunk(text: string, count: number, overlap: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += count - overlap) {
    chunks.push(
      sentences
        .slice(i, i + count)
        .join(' ')
        .trim()
    );
    if (i + count >= sentences.length) break;
  }
  return chunks;
}

function semanticMockChunk(text: string): string[] {
  // Simple paragraph based chunking as a proxy for semantic units in this prototype
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
}
