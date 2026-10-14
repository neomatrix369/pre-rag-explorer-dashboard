# Project Invariants — Pre-RAG Explorer Dashboard

> Self-contained reference — key constraints extracted here. Links provided for traceability only.
> Created by plan-health-check (EFP audit/reconcile migration) on 2026-10-13.
> **Every executor must read this file before starting any slice** — do not rely on conversation history alone.

---

## Key Constraints

- **Browser-only architecture (non-negotiable)** — all processing (parsing, chunking, embedding, retrieval) runs in-browser. No backend, no server, no data leaves the machine.
  → Source: `docs/adr/ADR-001-browser-only-architecture.md`
- **No backend services** — IndexedDB for persistence, Transformers.js (Xenova) for embeddings, BM25 computed in-browser. Adding FastAPI/Node backend would violate ADR-001.
- **All quality gates must pass before any merge** — `./scripts/quality-gates.sh` is the single authoritative entry point (CI mirror).
- **Coverage threshold enforced at 40%** (actual ~72%) — never lower the threshold; raise it when a new service reaches steady state.
- **ESLint strict mode** — `--max-warnings 0`; any new warning is a gate failure.
- **React 19 + `@testing-library/react ^16.1`** — do NOT add `--legacy-peer-deps`; it was removed in Infra slice.
  → Source: `docs/_internal/PROGRESS.md` Decision Log (2026-05-28)

---

## Architecture Decisions (Non-Negotiable)

- **MODEL_REGISTRY is the single source of truth** for embedding model metadata — `constants/modelRegistry.ts`. Never hardcode model IDs or dimensions elsewhere.
  → Source: `docs/plan/DECISIONS.md` (Slice 5 row) + `CLAUDE.md § Model Registry`
- **VectorCollection** stores chunks + embedding vectors + metadata (method, params, source file, embeddingModel) — schema must not change without a dedicated slice.
- **IndexedDB schema** (`RAGExplorerDB` v2) — `collections` and `files` stores. Schema migrations require a version bump.
- **Experiment metadata** → localStorage (not IndexedDB). Do not move without a dedicated slice.
- **Path alias `@/*`** resolves to project root — always use it for cross-directory imports.

---

## Tech Stack & Runtime

- **Language**: TypeScript (strict mode progressively enabled)
- **Framework**: React 19, Vite
- **Embedding**: Transformers.js (`@xenova/transformers` ≥ 2.17.2), lazy-loads models on first use
- **Models**: `all-minilm-l6-v2` (default, ~23MB, 384-dim), `bge-small-en-v1.5` (~33MB, 384-dim)
- **Test runner**: Vitest 4.x with V8 coverage
- **Node**: 20 (`.nvmrc` controls — `nvm use` before `npm install`)
- **Optional**: `GEMINI_API_KEY` env var for Gemini integration (core RAG does not need it)
- **Model split** — Planning: claude-opus-4-8 · Execution: claude-sonnet-4-6
  → Source: `docs/plan/TRAIL.md § Original Material`

---

## Project Rules (from CLAUDE.md)

- **Incremental evolution** — never start from scratch when a foundation exists; extend, refine, compose.
- **Reuse first** — search before writing new code; one owner per concern (SSOT).
- **Composition over inheritance** — compose small units; no parallel paths.
- **Conventional Commits** — `type(scope): description`; no `Co-Authored-By:` trailers; branch before commit (never commit directly to `main`).
- **Verify after every change** — tests pass, build clean, docs current before marking any slice complete.
  → Source: `~/.claude/CLAUDE.md` (global) + `CLAUDE.md` (project)

---

## Decision Ownership

See `docs/plan/DECISION-OWNERSHIP.md` for Human vs Agent ownership matrix.
When that file has unfilled TBD rows → **halt and HITL** before executing a slice.
