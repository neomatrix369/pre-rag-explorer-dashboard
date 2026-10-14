# Slice 14 — Scoring View + Golden Dataset

> **Status**: 📋 PLANNED | **MoSCoW**: Should | **Depends on**: Slice 13 (experiment diff)
> **Branch**: `slice/14-scoring-view` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add a scoring view that lets users upload a golden dataset (query → expected chunks), run it against a collection, and see precision/recall/MRR metrics.
- **Depends on**: `SearchResult` type and retrieval pipeline from `utils/similarity.ts`
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Automatic golden dataset generation
- Cross-collection batch evaluation (2+ collections at once)
- Backend evaluation pipeline (browser-only constraint — ADR-001)
- LLM-as-judge scoring (would require API call)

---

## Output Contract

- **Baseline**: `npm run test` all passing; retrieval pipeline working
- Golden dataset upload: JSON format `[{ query: string, expectedChunkIds: string[] }]`
- Scoring engine: precision@k, recall@k, MRR computed in-browser
- Scoring view: per-query results table + aggregate metrics summary
- ≥6 tests: metric computations correct (precision, recall, MRR), edge cases (empty results, perfect results, no overlap)
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** a golden dataset JSON file with 5 query/expected-chunk pairs,
**When** uploaded and "Run Evaluation" is clicked against a collection,
**Then** precision@5, recall@5, and MRR are computed and displayed for each query and as aggregate.

**Given** a golden dataset where all expected chunks are returned in position 1,
**When** evaluation runs,
**Then** precision=1.0, recall=1.0, MRR=1.0.

**Given** an empty results set for a query,
**When** evaluation runs,
**Then** that query scores 0 for all metrics without error.

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/14-scoring-view`
- [ ] Read `utils/similarity.ts` — understand `SearchResult` shape
- [ ] Define golden dataset JSON schema before writing upload code

---

## After-Checks

- [ ] Golden dataset upload working (JSON parse + validate)
- [ ] `precision@k`, `recall@k`, `MRR` functions implemented as pure utilities
- [ ] Scoring view renders per-query + aggregate results
- [ ] ≥6 tests; all tests pass
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test
- [ ] Complexity evidence: `scripts/complexity-report.sh` (policy: TBD per DECISION-OWNERSHIP.md)

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-solution-architect-reviewer` + `nw-system-designer-reviewer` — data flow review (parallel; scoring pipeline introduces new data flow)
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-14.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
