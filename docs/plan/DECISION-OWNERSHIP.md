# Decision Ownership — Pre-RAG Explorer Dashboard

> Created by plan-health-check (EFP audit/reconcile migration) on 2026-10-13.
> Portable contract: `decision-ownership` rule (always-on in `~/.claude/rules/decision-ownership.md`).
> **Fill the TBD rows below (USER_FIX) before any slice execution begins.**
> Missing filled matrix ⇒ halt/HITL until USER_FIX completes.

---

## Ownership Matrix

| Who | Owns |
|-----|------|
| **Human** | MoSCoW/YAGNI scope decisions; ADR acceptance; quality threshold changes (coverage floor, ESLint rules); new dependency approval; release/tag decisions; CF account setup (Slice 4); merge to main |
| **Agent** | Reversible implementation within slice AC; gate wiring; docs/diagram sync; test writing (Red→Green, never weaken/skip assertions); complexity gate evidence; coverage evidence |
| **Shared** | ADR drafts (agent drafts → human accepts); CF deferral decisions; slice-level exit criteria definition |

---

## Fail-Closed Rules (Agent Must Not Loosen)

- Never merge directly to `main` — always via PR with quality gates
- Never lower coverage threshold below 40%
- Never disable `--max-warnings 0` in ESLint
- Never add backend services (violates ADR-001)
- Never commit `GEMINI_API_KEY` or other secrets (gitleaks gate enforces)
- Raising quality thresholds (coverage, complexity ceiling) = HITL

---

## Concurrency & Budget Ceilings

| Dimension | Ceiling | Owner |
|-----------|---------|-------|
| Parallel slices in flight | 1 (solo project) | Human |
| Max PR size (LOC diff) | 400 LOC (reviewable in ≤30 min) | Human |
| Max new dependencies per slice | 2 (must pass `npm audit`) | Human |

Raising any ceiling = HITL.

---

## Model Registry Namespace Ownership

**Human** owns the addition of new models to `MODEL_REGISTRY` in `constants/modelRegistry.ts`.

Rationale: each new model increases browser bundle download size and in-browser memory usage; approval requires explicit human sign-off. Agent may draft the registry entry and tests; human merges via PR.

---

## Slice 4 (Cloudflare) Resume Trigger

**Human** owns the resume decision. Trigger conditions:
1. User acquires a Cloudflare account / Pages project
2. User explicitly re-opens Slice 4 (e.g. via `plan-modifier` Add/Resume)

Agent must not auto-resume Slice 4. CF deferral remains until human signal.

---

## Complexity Enforcement Mode

**Mode**: `reporting` (warn-only, non-fatal)

Evidence: `scripts/complexity-report.sh` uses `|| true` after the ESLint complexity run — violations write report but do not fail the gate. Current policy: complexity report appears in PR body as evidence; gate does not block merge on threshold breach.

**To switch to `enforcing`**: remove `|| true` from `scripts/complexity-report.sh` and set `eslint.complexity.config.cjs` rules to `"error"` instead of `"warn"`. Requires Human approval (raises gate strictness — HITL per fail-closed rules).
