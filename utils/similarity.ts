export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
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

  const df: Record<string, number> = {};
  queryTerms.forEach((term) => {
    df[term] = docTokens.filter((tokens) => tokens.includes(term)).length;
  });

  return docTokens.map((tokens) => {
    let score = 0;
    const tfMap: Record<string, number> = {};
    tokens.forEach((t) => (tfMap[t] = (tfMap[t] || 0) + 1));

    queryTerms.forEach((term) => {
      const tf = tfMap[term] || 0;
      const docFreq = df[term] || 0;
      const idf = Math.log((n - docFreq + 0.5) / (docFreq + 0.5) + 1);
      score += (idf * (tf * (k1 + 1))) / (tf + k1 * (1 - b + b * (tokens.length / avgDocLength)));
    });
    return score;
  });
}
