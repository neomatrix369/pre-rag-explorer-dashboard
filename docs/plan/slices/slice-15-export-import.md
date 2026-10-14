# Slice 15 — Export/Import

> **Status**: 📋 PLANNED | **MoSCoW**: Could | **Depends on**: Slice 14 (scoring view)
> **Branch**: `slice/15-export-import` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add JSON snapshot export and import for experiments and VectorCollections, enabling sharing of experiment configurations between users.
- **Depends on**: `VectorCollection` schema in IndexedDB; `Experiment` in localStorage; `vectorStore.ts` CRUD
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Cloud sync or sharing via URL (browser-only)
- Export to formats other than JSON (CSV, Parquet — future)
- Import of raw document files (separate from experiment snapshots)
- Automatic conflict resolution on import (manual merge only)

---

## Output Contract

- **Baseline**: `npm run test` all passing; VectorCollection and Experiment types stable
- Export button in Collections view: downloads a JSON snapshot of selected collection(s) + experiment metadata
- Import button: uploads JSON snapshot, creates collections in IndexedDB
- JSON schema documented (versioned: `{ version: 1, collections: [...], experiments: [...] }`)
- ≥6 tests: export produces valid JSON, import restores collections, version mismatch handled, empty export edge case
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** a user has 2 collections in IndexedDB,
**When** they click Export and select both,
**Then** a JSON file is downloaded containing both collections with all chunk/vector data.

**Given** a valid JSON snapshot file,
**When** the user imports it on a fresh session,
**Then** both collections appear in the Collections view with all original data.

**Given** a JSON snapshot with `version: 2` (future format) imported on a `version: 1` parser,
**When** import is attempted,
**Then** a clear error message is shown (no silent data corruption).

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/15-export-import`
- [ ] Read `services/vectorStore.ts` — understand export/read patterns
- [ ] Define JSON schema and version before writing import/export code

---

## After-Checks

- [ ] Export serializes `VectorCollection` + `Experiment` to JSON
- [ ] Import deserializes and restores to IndexedDB
- [ ] Version mismatch handled gracefully
- [ ] ≥6 tests; all tests pass
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test
- [ ] Complexity evidence: `scripts/complexity-report.sh` (policy: TBD per DECISION-OWNERSHIP.md)

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-solution-architect-reviewer` + `nw-system-designer-reviewer` — data flow review (parallel; IndexedDB import is new data flow)
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-15.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
