# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Development
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run preview   # Preview production build

# Quality Gates (Slice 1+)
npm run lint           # ESLint (79 warnings acceptable)
npm run typecheck      # TypeScript type checking
npm run test           # Vitest unit tests (3 tests)
npm run test:coverage  # Coverage report (8% baseline)
npm audit --audit-level=high  # Security audit (0 vulnerabilities)

# Quick verification
npm run test:all       # lint + typecheck + test
```

**Note**: Install dependencies with `npm install --legacy-peer-deps` (React 19 compatibility).

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

---

## Slice Execution Pattern

**Learnings from Slice 1** (see `docs/slices/SLICE-01-TOOLCHAIN.md` for full audit)

### Pre-Slice Checklist (MUST DO BEFORE CODING)

```markdown
- [ ] Read docs/slices/PROGRESS.md (understand current state)
- [ ] Create docs/slices/SLICE-XX-NAME.md (slice specification)
- [ ] Research compatibility (if upgrading dependencies)
- [ ] Establish baseline metrics (run commands to get actual numbers)
- [ ] Set realistic thresholds (baseline ± 5%, not aspirational)
- [ ] Update PROGRESS.md status to "IN PROGRESS"
```

### Execution Steps

**1. Research Phase (15 min)**
- Check dependency compatibility (React 19 requires --legacy-peer-deps)
- Review migration guides if upgrading major versions
- Verify baseline metrics before setting thresholds
- List known issues and mitigation strategies

**2. Implementation Phase**
- Configure tools BEFORE integrating (test standalone first)
- Match CI and local environments exactly
- Update progress docs after each major step (resumable state)
- Document decisions in PROGRESS.md decision log

**3. Verification Phase**
- Run ALL quality gates locally before pushing:
  ```bash
  npm run lint
  npm run typecheck
  npm run test
  npm run test:coverage
  npm audit --audit-level=high
  npm run build
  ```
- Verify baselines match expectations
- Fix issues comprehensively (not workarounds)

**4. Commit Phase**
- Single commit per logical unit
- Detailed commit messages (what, why, impact, verification)
- NO `Co-Authored-By: Claude` trailers

### Key Principles (From Slice 1 Learnings)

**✅ DO:**
- Research first, implement second
- Verify baselines before setting thresholds
- Fix comprehensively (not workarounds)
- Test major upgrades (don't assume they break)
- Configure tools before integrating
- Match CI and local environments
- Update progress docs continuously

**❌ DON'T:**
- Assume major version upgrades will break (test first)
- Use workarounds before trying comprehensive fix
- Set aspirational thresholds without verifying baseline
- Adjust tests to pass without understanding failures
- Create temporary tracking files (use docs/slices/ from start)

### Decision Documentation Template

When making pragmatic choices, document in `PROGRESS.md` decision log:

```markdown
| Date | Slice | Decision | Why |
|------|-------|----------|-----|
| YYYY-MM-DD | N | Short decision | Rationale (context, alternatives, tradeoffs) |
```

### Quality Gate Baseline (Post-Slice 1)

```
npm run lint           → 79 warnings, 0 errors (19 unused, 60 false positives)
npm run typecheck      → 0 errors
npm run test           → 3/3 passing
npm run test:coverage  → 8.04% (vitest 4.x baseline)
npm audit              → 0 vulnerabilities (ALL deps)
npm run build          → 2.73s, dist/ created
```

**Known State:**
- React 19 + @testing-library/react@15 requires --legacy-peer-deps
- Vitest 4.x calculates coverage differently than 1.x (expect lower %)
- ESLint warnings to be addressed in Slice 2
- Coverage to be increased in Slice 3 (target 40%+)
