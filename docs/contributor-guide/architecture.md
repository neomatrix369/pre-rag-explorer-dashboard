# Architecture

Browser-only RAG exploration dashboard. Contrast with [rag-params-finder ADR-001](https://github.com/) two-process design — see [ADR-001](../adr/ADR-001-browser-only-architecture.md).

---

## Data flow

```
Upload (FileUpload)
  → parse (fileParser.ts)
  → chunk (chunkingService.ts — 6 methods)
  → embed (embeddingService.ts — Transformers.js, model from registry)
  → store (vectorStore.ts — IndexedDB)
  → search (similarity.ts — dense / sparse / hybrid)
```

All processing runs in the browser. No backend. Optional `GEMINI_API_KEY` for future Gemini features only.

---

## Module map

| Layer | Path | Responsibility |
|-------|------|----------------|
| UI | `App.tsx`, `components/**` | Views: Upload, Process, Search, Collections |
| Types | `types.ts` | VectorCollection, SearchResult, Experiment, ChunkingMethod |
| Registry | `constants/modelRegistry.ts` | Embedding model metadata + defaults |
| Validation | `utils/modelValidation.ts` | Model ID guards |
| Services | `services/fileParser.ts` | TXT, CSV, MD, PDF → text |
| Services | `services/chunkingService.ts` | Fixed, Recursive, Token, Sentence, Semantic, Sliding Window |
| Services | `services/embeddingService.ts` | Singleton Transformers.js pipeline |
| Services | `services/vectorStore.ts` | IndexedDB CRUD (`RAGExplorerDB` v2) |
| Retrieval | `utils/similarity.ts` | Cosine, BM25, hybrid scoring |
| State | `App.tsx` hooks | Hydrates IndexedDB + localStorage on mount |

Path alias: `@/*` → project root.

---

## Processing model

Each **file × chunking method × embedding model** produces one `VectorCollection` persisted to IndexedDB.

Models lazy-load on first use (~23–33 MB) and cache in browser storage.

---

## Testing boundaries

| Tier | Location | Purpose |
|------|----------|---------|
| Fast unit | `services/**/*.test.ts`, `utils/**`, `constants/**` | Mocked I/O, Vitest + fake-indexeddb |
| Import smoke | `services/__tests__/importSmoke.test.ts` | Gate B — all service modules load |
| Integration | Not yet automated | Model download, full UI flows — manual or Playwright (future) |
| Benchmarks | `benchmarks/` | Chunk/search perf baselines (future scripts) |

---

## Security model

- Secrets: `.env.local` gitignored; `.env.example` template; gitleaks in Husky/CI
- No server-side API keys required for core RAG
- `eslint-plugin-security` on all TS
- shellcheck on `scripts/*.sh`, actionlint on GitHub workflows, markdownlint on `*.md` (see [development.md](development.md))
- `protobufjs` override in `package.json` for transitive CVE remediation

---

## Deployment (planned)

Slice 4 (parked): static Vite build → Cloudflare Pages. No backend added at deploy time.

---

## See also

- [Development Guide](development.md) — setup and quality gates
- [ADR-001](../adr/ADR-001-browser-only-architecture.md) — why browser-only
- [PROGRESS.md](../slices/PROGRESS.md) — slice roadmap
