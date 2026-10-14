# Slice 10 — Third Model (GTE-small)

> **Status**: 📋 PLANNED | **MoSCoW**: Could | **Depends on**: Slice 5+6 (model registry)
> **Branch**: `slice/10-third-model-gte` (create before first commit)
> **Scenario**: Brownfield + Growing

---

## Session Bootstrap

> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.

- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → `docs/plan/invariants.md` → this stub

---

## Context

- **Stage objective**: Add `gte-small` as a third embedding model via MODEL_REGISTRY, validating the registry's extensibility pattern.
- **Depends on**: `test -f constants/modelRegistry.ts` (2-model registry from Slice 5+6); `test -f utils/modelValidation.ts`
- **Global invariants**: → `docs/plan/invariants.md`

> Executor may diverge from plan if new evidence warrants — document deviations in PROGRESS.md before marking PASSED.

---

## Non-goals

- Changes to chunking methods (Slices 7–8)
- Changes to retrieval modes (Slice 9)
- UI redesign of model selector (extend existing dropdown)
- Model fine-tuning or custom weights

---

## Output Contract

- **Baseline**: `npm run test` all passing; 2 models in registry
- `thenlper/gte-small` added to `MODEL_REGISTRY` with correct metadata (dimensions: 384, size: ~67MB, HuggingFace ID)
- `ModelId` union type updated
- UI model selector shows 3 models
- ≥3 tests: registry has 3 entries, GTE-small metadata correct, validation passes
- All quality gates pass

---

## Acceptance Criteria (GWT)

**Given** the MODEL_REGISTRY is loaded,
**When** `getAllModelIds()` is called,
**Then** it returns 3 IDs including `gte-small`.

**Given** `getModelById('gte-small')`,
**When** called,
**Then** returns correct metadata (dimensions: 384, huggingFaceId: `thenlper/gte-small`).

**Given** the Process UI is open,
**When** the model selector is rendered,
**Then** all 3 models appear with names and descriptions.

---

## Before-Checks

- [ ] `git status` — clean on `main`
- [ ] `git checkout -b slice/10-third-model-gte`
- [ ] Verify `thenlper/gte-small` HuggingFace ID and dimensions before coding

---

## After-Checks

- [ ] `gte-small` in `MODEL_REGISTRY` with verified metadata
- [ ] `ModelId` type includes `gte-small`
- [ ] ≥3 tests added; all tests pass
- [ ] UI model selector shows 3 models
- [ ] `./scripts/quality-gates.sh` — all gates pass
- [ ] Specification coverage: every GWT clause has ≥1 test

---

## Closing Gates

- [ ] `nw-at-completeness-check` — AT completeness audit
- [ ] `nw-software-crafter-reviewer` — code quality + TDD discipline
- [ ] `nw-gate-evidence-validator` — all 9 conditions (`docs/plan/gate-evidence/slice-10.json`)
- [ ] `/verify-slice` — holistic verdict COMPLETE
