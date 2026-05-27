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

## Deployment

| Path | Status | Notes |
|------|--------|-------|
| **Docker (Infra)** | Available | Multi-stage build → nginx serves `dist/` on port 3000; `./start-services.sh` |
| **Cloudflare Pages** | Slice 4 parked | No CF account; static hosting only when resumed |

No backend is added at deploy time — ADR-001 browser-only architecture is unchanged.

---

## Technical components

### Frontend (React + TypeScript)
- **UI Framework**: React 19.2.4 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0 for fast development
- **State Management**: React hooks with local state
- **Styling**: Tailwind-like utility classes

### ML & Embeddings
- **Registry**: `constants/modelRegistry.ts` — centralized model metadata and defaults
- **Validation**: `utils/modelValidation.ts` — type-safe model ID checks
- **Models**: Xenova/all-MiniLM-L6-v2 (default), Xenova/bge-small-en-v1.5
- **Library**: @xenova/transformers 2.17.2
- **Dimensions**: 384 (both current models)
- **Execution**: Client-side, in-browser processing with model switching

### Services Architecture
```
constants/
└── modelRegistry.ts     # MODEL_REGISTRY, ModelConfig, DEFAULT_MODEL_ID

utils/
└── modelValidation.ts   # validateModelConfig, getModelById, isValidModelId, etc.

services/
├── fileParser.ts        # Handles text, CSV, PDF, markdown parsing
├── chunkingService.ts   # Implements 6 chunking strategies
├── embeddingService.ts  # Embeddings via Transformers.js (modelId-aware)
└── vectorStore.ts       # IndexedDB operations for collections
```

### Component Structure
```
components/
├── layout/
│   ├── Sidebar.tsx           # Navigation with 4 views
│   ├── GuidanceBalloon.tsx   # Contextual help
│   └── ErrorDisplay.tsx      # Error handling UI
├── upload/
│   └── FileUpload.tsx        # File upload interface
├── chunking/
│   └── ProcessSection.tsx    # Chunking configuration & processing
├── search/
│   └── SearchSection.tsx     # Search interface & results
├── collections/
│   └── CollectionsManager.tsx # Vector collection management
└── common/
    └── CopyButton.tsx        # Reusable copy-to-clipboard
```

---

## See also

- [Development Guide](development.md) — setup and quality gates
- [ADR-001](../adr/ADR-001-browser-only-architecture.md) — why browser-only
- [PROGRESS.md](../_internal/PROGRESS.md) — slice roadmap
