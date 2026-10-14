# Slice 8 — Markdown-Aware Chunking

> **Status**: 📋 PLANNED | **MoSCoW**: Should | **Depends on**: Slice 7 (sliding window), Slice Infra
> **Branch**: `slice/8-markdown-chunking` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment (Node 20 via `.nvmrc`)
- **Test source**: → CLAUDE.md § Testing (Vitest, `npm run test`, mock transformers.js)
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

> Read before any implementation. Do not rely on conversation history alone.

- **Stage objective**: Add `MARKDOWN` as a 7th chunking method that splits on markdown headers (h1/h2/h3), preserves code blocks and list boundaries, and handles frontmatter.
- **Depends on**: `test -f services/chunkingService.ts` (Slice 7 output — slidingWindowChunk present); `test -f docs/plan/slices/slice-7-sliding-window.md`
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

> Out of scope for this slice — do not implement here.

- HTML chunking (separate slice if ever needed)
- PDF structure-aware chunking (complex; future slice)
- Semantic markdown understanding (Slice 9+ territory)
- Changes to retrieval pipeline (Search/Collections UI unchanged)

---

## Output Contract

> Observable shape of completion (shape only — not exact file paths).

- **Baseline**: `npm run test` → 81 passing; `npm run lint` → 0 warnings; `npm run typecheck` → 0 errors
- `ChunkingMethod.MARKDOWN` added to enum
- `markdownChunk()` function that splits on h1/h2/h3 headers, preserves code fences and list blocks
- UI dropdown includes "Markdown" option
- ≥8 tests covering: basic split, code block preservation, list preservation, nested headers, empty text, no headers (falls back), frontmatter stripping
- All quality gates pass (`./scripts/quality-gates.sh`)
- `README.md` updated to "7 Chunking Strategies"

---

## Acceptance Criteria (GWT)

**Given** a markdown document with h1/h2/h3 headers and code blocks,
**When** `markdownChunk()` is called,
**Then** chunks are split at each header boundary and code blocks are kept intact (not split mid-fence).

**Given** a markdown document with no headers,
**When** `markdownChunk()` is called,
**Then** the entire document is returned as a single chunk (graceful fallback).

**Given** a markdown document with YAML frontmatter (`---`),
**When** `markdownChunk()` is called,
**Then** frontmatter is stripped from the first chunk or treated as metadata.

**Given** `ChunkingMethod.MARKDOWN` selected in the Process UI,
**When** a file is processed,
**Then** a `VectorCollection` is created with `method: MARKDOWN` in its metadata.

---

## Implementation Notes

- Follow the same pattern as `slidingWindowChunk()` — pure function, typed args/return
- Add `MARKDOWN` to `ChunkingMethod` enum in `types.ts`
- Add `MARKDOWN` label in `constants.tsx`
- Add `markdownChunk()` to `chunkingService.ts` + switch case
- Add conditional UI params (min chunk size, include/exclude headers as text) in `ProcessSection.tsx`
- Tests in `services/__tests__/chunkingService.test.ts` (extend existing file)
- Reuse existing `chunkingService.ts` test patterns (mock input, assert output shape)

---

## Before-Checks

- [ ] `git status` — clean working tree on `main`
- [ ] `git checkout -b slice/8-markdown-chunking`
- [ ] `npm run test` — 81/81 passing (baseline confirmed)
- [ ] `npm run lint` — 0 warnings (baseline confirmed)
- [ ] Read `docs/plan/invariants.md`
- [ ] Read `services/chunkingService.ts` to understand existing pattern before writing new code

---

## After-Checks

- [ ] `ChunkingMethod.MARKDOWN` in `types.ts` enum
- [ ] `markdownChunk()` implemented with h1/h2/h3 split logic
- [ ] Code block preservation verified (test case)
- [ ] Graceful fallback for no-headers case (test case)
- [ ] ≥8 tests added; all tests pass
- [ ] `npm run test:coverage` — ≥40% maintained (expect improvement)
- [ ] `npm run lint` — 0 warnings
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run build` — clean
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] `README.md` updated to "7 Chunking Strategies"
- [ ] `docs/_internal/PROGRESS.md` updated with Slice 8 row
- [ ] `docs/plan/PROGRESS.md` updated: Slice 8 → ✅ PASSED
- [ ] Specification coverage: every GWT clause has ≥1 test (BDD/GWT-first)
- [ ] Branch coverage: target 100% on new `markdownChunk()` function
- [ ] Complexity evidence: `scripts/complexity-report.sh` runs clean; report written to `.reports/complexity/pr-body.md` (policy: `reporting` — warn-only, non-fatal; see `docs/plan/DECISION-OWNERSHIP.md`)

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit (slice close gate #8)
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline review (slice close gate #9)
- [ ] `nw-gate-evidence-validator` — all 9 gate-evidence conditions pass (`docs/plan/gate-evidence/slice-8.json`)
- [ ] `/verify-slice` — holistic evidence verdict COMPLETE (final closing gate)
