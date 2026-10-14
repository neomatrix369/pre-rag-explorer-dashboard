# Slice 9 — MMR Retrieval

> **Status**: 📋 PLANNED | **MoSCoW**: Should | **Depends on**: Slice 8 (markdown chunking)
> **Branch**: `slice/9-mmr-retrieval` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add Maximal Marginal Relevance (MMR) as a 4th retrieval mode, balancing relevance with diversity to reduce redundant results.
- **Depends on**: `test -f utils/similarity.ts` (dense, sparse, hybrid retrieval present from existing codebase)
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Changes to chunking methods (Slice 8)
- Changes to embedding models (Slices 10–11)
- Evaluation metrics / golden datasets (Slice 14)
- Cross-collection MMR (single collection only in this slice)

---

## Output Contract

- **Baseline**: `npm run test` all passing; `npm run lint` 0 warnings
- `RetrievalMethod.MMR` (or equivalent) added to retrieval mode types
- `mmrRetrieve()` function in `utils/similarity.ts` accepting `query`, `candidates`, `lambda` (diversity weight 0–1)
- UI: MMR option in Search section with lambda slider
- ≥6 tests: basic MMR, lambda=0 (pure diversity), lambda=1 (pure relevance), edge cases (empty candidates, k > candidates)
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** a query and a collection of embedded chunks,
**When** MMR retrieval is invoked with `lambda=0.5`,
**Then** results balance relevance to the query and diversity from each other (no two top-k results are near-duplicates).

**Given** `lambda=1.0`,
**When** MMR retrieval runs,
**Then** results are ranked purely by cosine similarity (equivalent to dense retrieval).

**Given** `lambda=0.0`,
**When** MMR retrieval runs,
**Then** results maximize pairwise diversity, ignoring query relevance.

**Given** `k > number of candidates`,
**When** MMR retrieval runs,
**Then** all candidates are returned without error.

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/9-mmr-retrieval`
- [ ] `npm run test` — all passing (baseline)
- [ ] Read `utils/similarity.ts` — understand existing dense/sparse/hybrid patterns

---

## After-Checks

- [ ] `mmrRetrieve()` implemented in `utils/similarity.ts`
- [ ] `RetrievalMethod` enum updated with MMR
- [ ] UI: MMR option + lambda slider in Search section
- [ ] ≥6 tests added; all tests pass
- [ ] `npm run lint` 0 warnings; `npm run typecheck` 0 errors
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test
- [ ] Complexity evidence: `scripts/complexity-report.sh` (policy: TBD per DECISION-OWNERSHIP.md)

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-9.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
