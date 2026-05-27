# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Development
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run preview   # Preview production build

# Quality Gates (matches CI — prefer single entry point)
./scripts/quality-gates.sh   # lint, format, typecheck, test, coverage, audit, build
npm run quality-gates        # same via npm script
npm run test:all             # lint + format:check + typecheck + test (no coverage/audit/build)
npm run verify               # typecheck + build

npm run lint                 # ESLint strict mode (--max-warnings 0)
npm run format:check         # Prettier
npm run typecheck            # TypeScript type checking
npm run test                 # Vitest unit tests (81 tests)
npm run test:coverage        # Coverage report (40% threshold, ~72% actual)
npm audit --audit-level=high # Security audit (0 vulnerabilities)
```

**Note**: Install dependencies with `npm install` (`@testing-library/react` ^16.1 supports React 19 peers).

## Architecture

This is a **100% browser-based RAG exploration dashboard** — no backend. All processing (parsing, chunking, embedding, retrieval) runs in-browser. No data leaves the machine.

### Data Flow

```
Upload Files → Parse (fileParser.ts) → Chunk (chunkingService.ts) → Embed (embeddingService.ts) → Store (vectorStore.ts) → Search (similarity.ts)
```

Processing is per `file × chunkingMethod × embeddingModel` combination. Each combination produces a `VectorCollection` saved to IndexedDB.

### Model Registry (`constants/modelRegistry.ts`)

| Module | Responsibility |
|---|---|
| `constants/modelRegistry.ts` | `MODEL_REGISTRY` with metadata (dimensions, size, HuggingFace ID, defaults) |
| `utils/modelValidation.ts` | `getModelById`, `isValidModelId`, `validateModelConfig`, etc. |
| `constants.tsx` | Re-exports registry for backward-compatible imports |

**Current models**: `all-minilm-l6-v2` (default, ~23MB), `bge-small-en-v1.5` (~33MB). Both 384-dim.

### Services (`services/`)

| Service | Responsibility |
|---|---|
| `fileParser.ts` | Parse `.txt`, `.csv`, `.pdf`, `.md` into plain text |
| `chunkingService.ts` | 6 strategies: Fixed, Recursive, Token, Sentence, Semantic, Sliding Window |
| `embeddingService.ts` | Singleton wrapping Transformers.js; accepts `modelId` from registry. Lazy-loads models on first use. |
| `vectorStore.ts` | IndexedDB CRUD for `collections` and `files` stores (DB: `RAGExplorerDB` v2) |

### Retrieval (`utils/similarity.ts`)

Three retrieval modes: **dense** (cosine similarity), **sparse** (BM25), **hybrid** (weighted combination).

### State Management

`App.tsx` owns all state via React hooks. On mount it hydrates from storage:
- Files + VectorCollections → IndexedDB
- Experiment metadata → localStorage

The 4 main views (Upload, Process, Search, Collections) are controlled by `activeView` state and rendered in the main content area.

### Key Types (`src/types.ts`)

- `VectorCollection` — chunks + embedding vectors + metadata (method, params, source file, embeddingModel)
- `SearchResult` — chunk, score, retrievalMethod, collectionName
- `Experiment` — run metadata stored to localStorage
- `ChunkingMethod` — enum: FIXED, RECURSIVE, TOKEN, SENTENCE, SEMANTIC, SLIDING_WINDOW
- `ModelConfig` / `ModelId` — embedding model registry types (see `constants/modelRegistry.ts`)

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
- Check dependency compatibility (React 19 peer deps on test libraries)
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

### Quality Gate Baseline (Post-Slice Infra, verified 2026-05-27)

```
./scripts/quality-gates.sh → all gates pass (CI mirror)
npm run lint           → 0 warnings, 0 errors (--max-warnings 0)
npm run typecheck      → 0 errors
npm run test           → 81/81 passing (incl. import smoke)
npm run test:coverage  → ~72% lines, 40% threshold enforced
npm audit              → 0 vulnerabilities (ALL deps)
npm run build          → ~3.2s, dist/ created
```

**Known State:**
- @testing-library/react ^16.1 required for React 19 peer resolution (no --legacy-peer-deps)
- Vitest 4.x calculates coverage differently than 1.x
- Service coverage focuses on `services/**/*.ts`; chunkingService lower (~45%) — target for future slices
- Infra slice on `feat/slice-infra-hardening`: CI parity, gitleaks, `check_integrity.sh`, contributor docs (see `docs/slices/SLICE-INFRA-HARDENING.md`)

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
