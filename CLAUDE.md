# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run preview   # Preview production build
```

No test or lint commands are configured.

## Architecture

This is a **100% browser-based RAG exploration dashboard** — no backend. All processing (parsing, chunking, embedding, retrieval) runs in-browser. No data leaves the machine.

### Data Flow

```
Upload Files → Parse (fileParser.ts) → Chunk (chunkingService.ts) → Embed (embeddingService.ts) → Store (vectorStore.ts) → Search (similarity.ts)
```

Processing is per `file × chunkingMethod` combination. Each combination produces a `VectorCollection` saved to IndexedDB.

### Services (`src/services/`)

| Service | Responsibility |
|---|---|
| `fileParser.ts` | Parse `.txt`, `.csv`, `.pdf`, `.md` into plain text |
| `chunkingService.ts` | 5 strategies: Fixed, Recursive, Token, Sentence, Semantic |
| `embeddingService.ts` | Singleton wrapping Transformers.js (Xenova/all-MiniLM-L6-v2, 384-dim). Lazy-loads ~23MB model on first use. |
| `vectorStore.ts` | IndexedDB CRUD for `collections` and `files` stores (DB: `RAGExplorerDB` v2) |

### Retrieval (`src/utils/similarity.ts`)

Three retrieval modes: **dense** (cosine similarity), **sparse** (BM25), **hybrid** (weighted combination).

### State Management

`App.tsx` owns all state via React hooks. On mount it hydrates from storage:
- Files + VectorCollections → IndexedDB
- Experiment metadata → localStorage

The 4 main views (Upload, Process, Search, Collections) are controlled by `activeView` state and rendered in the main content area.

### Key Types (`src/types.ts`)

- `VectorCollection` — chunks + embedding vectors + metadata (method, params, source file)
- `SearchResult` — chunk, score, retrievalMethod, collectionName
- `Experiment` — run metadata stored to localStorage
- `ChunkingMethod` — enum: FIXED, RECURSIVE, TOKEN, SENTENCE, SEMANTIC

### Path Alias

`@/*` resolves to the project root (configured in `tsconfig.json` and `vite.config.ts`).

### Optional Gemini Integration

`GEMINI_API_KEY` env var is loaded via Vite's `define` config. The `@google/genai` package is installed but the integration is minimal/optional.
