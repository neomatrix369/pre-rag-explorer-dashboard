# Slice 11 — Fourth Model (E5 Multilingual)

> **Status**: 📋 PLANNED | **MoSCoW**: Could | **Depends on**: Slice 10 (GTE-small)
> **Branch**: `slice/11-fourth-model-e5` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add `multilingual-e5-small` as a fourth embedding model for cross-language document support.
- **Depends on**: `test -f constants/modelRegistry.ts` (3-model registry from Slice 10)
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Language detection or auto-selection of model
- Translation of documents
- Changes to chunking or retrieval modes

---

## Output Contract

- **Baseline**: `npm run test` all passing; 3 models in registry
- `intfloat/multilingual-e5-small` added to `MODEL_REGISTRY` with verified dimensions and model size
- `ModelId` union type updated
- UI shows 4 models
- ≥3 tests: registry has 4 entries, E5 metadata correct, validation passes
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** a non-English document uploaded and processed with `multilingual-e5-small`,
**When** a query in the same language is submitted,
**Then** relevant chunks are returned (manual verification).

**Given** `getModelById('multilingual-e5-small')`,
**When** called,
**Then** returns correct dimensions and HuggingFace ID.

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/11-fourth-model-e5`
- [ ] Verify `intfloat/multilingual-e5-small` dimensions (384 or 384?) against HuggingFace before coding

---

## After-Checks

- [ ] `multilingual-e5-small` in `MODEL_REGISTRY`
- [ ] `ModelId` type updated
- [ ] ≥3 tests; all tests pass
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-11.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
