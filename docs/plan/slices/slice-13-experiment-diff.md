# Slice 13 — Experiment Diff

> **Status**: 📋 PLANNED | **MoSCoW**: Should | **Depends on**: Slice 12 (side-by-side view)
> **Branch**: `slice/13-experiment-diff` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add experiment comparison view that shows parameter differences (chunking method, model, chunk size, overlap) between two saved experiment runs, alongside their result sets.
- **Depends on**: `Experiment` type in `types.ts` (already exists — metadata stored to localStorage)
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Automatic scoring of result quality (Slice 14)
- Export of diff to file (Slice 15)
- More than 2 experiments compared at once

---

## Output Contract

- **Baseline**: `Experiment` type in `types.ts`; experiments stored to localStorage
- Diff view showing two experiments: parameter table (method, model, chunkSize, overlap/stride) + result comparison
- Parameters that differ are visually highlighted
- ≥4 tests: diff computed correctly, identical params show no diff, UI renders experiment metadata
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** two saved experiments with different chunking methods,
**When** the Diff view is opened with those experiments selected,
**Then** a parameter comparison table shows which parameters differ (highlighted) and which are the same.

**Given** two identical experiments,
**When** the Diff view is shown,
**Then** no parameters are highlighted as different.

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/13-experiment-diff`
- [ ] Read `types.ts` `Experiment` type — understand stored fields
- [ ] Read `App.tsx` — understand how experiments are saved/loaded from localStorage

---

## After-Checks

- [ ] Experiment diff component implemented
- [ ] Parameter highlighting working
- [ ] ≥4 tests; all tests pass
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-13.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
