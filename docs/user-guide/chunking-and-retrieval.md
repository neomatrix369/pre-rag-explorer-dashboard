# Chunking & Retrieval Reference

## Chunking Methods Explained

| Method | Description | Best For |
|--------|-------------|----------|
| **Fixed** | Splits text into equal-sized chunks with optional overlap | General-purpose, consistent chunk sizes |
| **Recursive** | Recursively splits on characters (paragraphs → sentences → words) | Preserving document structure |
| **Token** | Splits based on token count (word boundaries) | Language model compatibility |
| **Sentence** | Groups by sentence count | Maintaining semantic completeness |
| **Semantic** | Groups semantically similar sentences together | Preserving topic coherence |
| **Sliding Window** | Fixed window size with stride (step between windows) | Overlap via stride mental model (e.g. 75% overlap = stride 25% of window) |

---

## Retrieval Methods Explained

| Method | Algorithm | Strengths |
|--------|-----------|-----------|
| **Dense** | Cosine similarity on embeddings | Semantic understanding, handles paraphrasing |
| **Sparse** | BM25 (term frequency) | Keyword matching, exact term retrieval |
| **Hybrid** | Combined dense + sparse scoring | Best of both worlds, balanced results |
