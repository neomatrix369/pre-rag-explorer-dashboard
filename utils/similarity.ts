export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
    dotProduct += vecA[i] * vecB[i];
    // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
    normA += vecA[i] * vecA[i];
    // eslint-disable-next-line security/detect-object-injection -- Safe: numeric array index
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function computeBM25(query: string, documents: string[]): number[] {
  const k1 = 1.5;
  const b = 0.75;

  const queryTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 0);
  const docTokens = documents.map((doc) =>
    doc
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 0)
  );

  const avgDocLength = docTokens.reduce((acc, tokens) => acc + tokens.length, 0) / documents.length;
  const n = documents.length;

  // Use Map instead of Record for dynamic string keys
  const df = new Map<string, number>();
  queryTerms.forEach((term) => {
    df.set(term, docTokens.filter((tokens) => tokens.includes(term)).length);
  });

  return docTokens.map((tokens) => {
    let score = 0;
    const tfMap = new Map<string, number>();
    tokens.forEach((t) => tfMap.set(t, (tfMap.get(t) || 0) + 1));

    queryTerms.forEach((term) => {
      const tf = tfMap.get(term) || 0;
      const docFreq = df.get(term) || 0;
      const idf = Math.log((n - docFreq + 0.5) / (docFreq + 0.5) + 1);
      score += (idf * (tf * (k1 + 1))) / (tf + k1 * (1 - b + b * (tokens.length / avgDocLength)));
    });
    return score;
  });
}
