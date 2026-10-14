# Interview Summary — Pre-RAG Explorer Dashboard

> Reconstructed: true | Source: health-check (EFP audit/reconcile migration, 2026-10-13)
> Derived from: `docs/_internal/PROGRESS.md`, `docs/slices/`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/adr/ADR-001`
> Word count: ~450

---

## Project Goal

Build a **100% browser-based RAG exploration dashboard** that lets users upload documents, chunk them with multiple strategies, embed them with different models, and compare retrieval quality — all without a backend. No data leaves the user's machine.

**Primary value**: experiment with chunking + embedding combinations and observe how they affect search quality, all in a single browser tab.

---

## Scenario

**Brownfield + Growing** — The codebase has a working toolchain (ESLint, Vitest, Husky, CI), multiple merged feature slices, and an established quality baseline. New slices add RAG capabilities incrementally.

---

## Key Requirements (MoSCoW)

**Must:**
- Quality toolchain with CI parity (✅ done — Slice 1 + Infra)
- Zero ESLint warnings, strict mode (✅ done — Slice 2)
- ≥40% test coverage on services (✅ done — Slice 3, actual ~72%)
- MODEL_REGISTRY as SSOT for embedding models (✅ done — Slice 5/5+6)
- Multiple chunking methods — currently 6 (✅ done — Slice 7 added Sliding Window)
- Project hardening: CI parity, gitleaks, meta linters, Docker static deploy (✅ done — Infra)

**Should:**
- Markdown-aware chunking (Slice 8 — next)
- MMR retrieval with diversity weighting (Slice 9)
- Side-by-side chunk comparison UI (Slice 12)
- Experiment diff (Slice 13)
- Scoring view + golden dataset (Slice 14)

**Could:**
- Additional embedding models: GTE-small (Slice 10), E5 Multilingual (Slice 11)
- Export/Import JSON snapshots (Slice 15)
- Cloudflare Pages deploy (Slice 4 — deferred, no CF account)

**Won't (now):**
- Backend server (violates ADR-001 browser-only constraint)
- E2E Playwright tests (deferred to Optimal tier)
- TypeScript strict mode full enforcement (future infra slice)

---

## Constraints

- Browser-only — all computation in-browser (ADR-001 is non-negotiable)
- No npm `--legacy-peer-deps` (resolved in Infra with RTL ^16.1)
- No direct commits to `main` — all work via feature branches + PRs
- All merges must pass `./scripts/quality-gates.sh` (CI mirror)
- Model sizes must stay practical for browser download (~23–33MB per model)

---

## Architecture Snapshot

```
Upload → Parse (fileParser.ts) → Chunk (chunkingService.ts) → Embed (embeddingService.ts) → Store (vectorStore.ts) → Search (similarity.ts)
```

- Per `file × chunkingMethod × embeddingModel` combination → `VectorCollection` in IndexedDB
- Three retrieval modes: dense (cosine), sparse (BM25), hybrid (weighted)
- `App.tsx` owns all state; 4 main views (Upload, Process, Search, Collections)

---

## Open Questions (at migration time)

1. Complexity enforcement mode — `enforcing` (gate fail) vs `reporting` (warn only) for `scripts/complexity-report.sh`
2. Slice 4 (Cloudflare) resume timeline — still blocked on CF account
3. Harness-scout YAML embed — pending `/skill-proposer` Steps 6c/6d run
