# PROGRESS.md — Pre-RAG Explorer Dashboard

**Last Updated**: 2026-10-13 (EFP migration)
**Current**: Slice 8 📋 PLANNED | Last passed: Infra ✅ (PR #20) · Slice 7 ✅ (PR #11)

> Source of truth for slice state. Historical per-slice detail: `docs/_internal/PROGRESS.md`.

---

## Quick Status

| # | Slice | Status | MoSCoW | Branch | PR | Notes |
|---|-------|--------|--------|--------|----|-------|
| 1 | Toolchain Foundation | ✅ PASSED | Must | `toolchain-setup` | — | ESLint, Prettier, Vitest, Husky, CI |
| 2 | Code Quality | ✅ PASSED | Must | `feat/slice-02-eslint-cleanup` | #7 | 79 warnings → 0 |
| 3 | Test Coverage | ✅ PASSED | Must | `feat/slice-03-test-coverage` | #8 | 37 tests, 71.42% |
| 4 | Cloudflare Deploy | 📦 DEFERRED | Should | — | — | No CF account; Docker covers static deploy |
| 5 | Registry Foundation | ✅ PASSED | Must | `feat/slice-05-registry-foundation` | #9 | MODEL_REGISTRY, 29 tests |
| 5+6 | Model Registry + bge-small | ✅ PASSED | Must | `feat/slice-05-06-model-registry` | #10 | 2nd model + UI |
| 7 | Sliding Window Chunking | ✅ PASSED | Should | `feat/slice-07-sliding-window` | #11 | Stride-based, 9 tests |
| Infra | Project Hardening | ✅ PASSED | Must | `feat/slice-infra-hardening` | #20 | CI parity, Docker, 81 tests |
| 8 | Markdown-Aware Chunking | 📋 PLANNED | Should | — | — | Next: split on headers |
| 9 | MMR Retrieval | 📋 PLANNED | Should | — | — | Diversity weighting |
| 10 | Third Model (GTE-small) | 📋 PLANNED | Could | — | — | Registry extensibility |
| 11 | Fourth Model (E5 Multilingual) | 📋 PLANNED | Could | — | — | Cross-language |
| 12 | Side-by-Side View | 📋 PLANNED | Should | — | — | Chunk comparison UI |
| 13 | Experiment Diff | 📋 PLANNED | Should | — | — | Parameter comparison |
| 14 | Scoring View + Golden Dataset | 📋 PLANNED | Should | — | — | Evaluation metrics |
| 15 | Export/Import | 📋 PLANNED | Could | — | — | JSON snapshot sharing |

**State machine**: `📋 PLANNED → 🔨 IN PROGRESS → 🔀 ON BRANCH → ✅ PASSED | 🔴 BLOCKED | 📦 DEFERRED`

---

## Resume Checklist

1. `git status` — check for uncommitted work
2. `git branch --show-current` — confirm correct branch
3. Find last completed slice in table above
4. Check slice stub in `docs/plan/slices/` for open exit criteria
5. Continue from next unchecked item

---

## Slice 4 — Deferred Resume Conditions

1. Cloudflare account created and configured
2. `CF_API_TOKEN` available for CI/CD
3. Project name registered in CF Pages
4. Re-open via `/plan-modifier` → Resume Slice 4
