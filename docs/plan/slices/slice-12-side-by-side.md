# Slice 12 — Side-by-Side View

> **Status**: 📋 PLANNED | **MoSCoW**: Should | **Depends on**: Slice 9 (MMR retrieval)
> **Branch**: `slice/12-side-by-side` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add a side-by-side comparison view that shows the same query results across two different collections (different chunking methods or embedding models), enabling direct experimentation comparison.
- **Depends on**: Collections UI established; multiple collections storable in IndexedDB
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Comparing more than 2 collections simultaneously (2-pane only in this slice)
- Automatic metric computation (Slice 14)
- Persisting comparison configurations across sessions
- Diff highlighting of chunk content (Slice 13)

---

## Output Contract

- **Baseline**: `npm run test` all passing; Search view works for single collection
- New "Compare" view (or toggle in Search view) showing two collection columns side by side
- Collection selector for each pane (left/right)
- Same query submitted to both collections simultaneously
- Results displayed in parallel with collection name + chunking method + model as headers
- ≥5 tests: component renders, collection selectors work, query dispatches to both, empty state handled
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** at least 2 collections exist in IndexedDB,
**When** the Compare view is opened,
**Then** two collection selectors are rendered, one per pane.

**Given** a query is entered in the Compare view,
**When** Search is clicked,
**Then** results appear in both panes simultaneously, each showing top-k chunks from its collection.

**Given** fewer than 2 collections exist,
**When** the Compare view is opened,
**Then** a message guides the user to create more collections first.

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/12-side-by-side`
- [ ] Read `components/search/SearchSection.tsx` — understand current search flow
- [ ] Read `App.tsx` state management — understand how collections are passed to views

---

## After-Checks

- [ ] Compare view implemented (new component or tab within Search)
- [ ] Dual collection selectors working
- [ ] Parallel search working
- [ ] ≥5 tests; all tests pass
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test
- [ ] Complexity evidence: `scripts/complexity-report.sh` (policy: TBD per DECISION-OWNERSHIP.md)

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-solution-architect-reviewer` + `nw-system-designer-reviewer` — data flow review (parallel)
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-12.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
