# TRAIL.md — Pre-RAG Explorer Dashboard

> EFP audit/reconcile migration applied 2026-10-13. Pre-existing plan artifacts migrated from `docs/slices/` + `docs/_internal/PROGRESS.md`.

## Original Material

**Project**: Pre-RAG Explorer Dashboard — 100% browser-based RAG exploration tool.
**Stack**: TypeScript · React 19 · Vite · Transformers.js (Xenova) · IndexedDB · Vitest
**Scenario**: Brownfield + Growing — working codebase with established toolchain, incrementally adding RAG features
**Quality gates**: `./scripts/quality-gates.sh` (CI mirror — ESLint → lint:meta → Prettier → typecheck → test → coverage → audit → build → gitleaks)
**ADR**: `docs/adr/ADR-001-browser-only-architecture.md` — no backend; all processing in-browser

```yaml
routing:
  scenario: "Brownfield + Growing"
  chosen: "2026-10-13"
  source: "health-check-inferred (EFP audit/reconcile migration)"

model_split:
  planning:
    model: claude-opus-4-8
    effort: high
    rationale: "Architecture decisions, slice scoping, health-check audit — needs deep reasoning"
  execution:
    model: claude-sonnet-4-6
    effort: medium
    rationale: "Incremental slice implementation — fast iteration over established patterns"

harness:
  permissions:
    allow:
      - Bash          # npm scripts, git, quality-gates.sh
      - Read          # all source + docs
      - Edit          # src/, tests/, docs/plan/
      - Write         # new slice stubs, gate-evidence JSON
    deny:
      - network_external  # browser-only project; no backend calls
  quality_gate_entry: "./scripts/quality-gates.sh"
  test_cmd: "npm run test"
  lint_cmd: "npm run lint"
  typecheck_cmd: "npm run typecheck"
  complexity_cmd: "scripts/complexity-report.sh"
  complexity_mode: "reporting"   # warn-only; see DECISION-OWNERSHIP.md
  coverage_threshold: 40
  coverage_scope: "services/**"
```

---

## Slices

| # | Name | Status | MoSCoW | Depends on | Branch | Notes |
|---|------|--------|--------|------------|--------|-------|
| 1 | Toolchain Foundation | ✅ PASSED | Must | none | `toolchain-setup` | ESLint, Prettier, Vitest, Husky, CI — baseline quality gates |
| 2 | Code Quality | ✅ PASSED | Must | 1 | `feat/slice-02-eslint-cleanup` | 79 warnings → 0; strict ESLint restored |
| 3 | Test Coverage | ✅ PASSED | Must | 2 | `feat/slice-03-test-coverage` | 37 tests, 71.42% coverage, 40% threshold |
| 4 | Cloudflare Deploy | 📦 DEFERRED | Should | 1 | — | No CF account; Docker static deploy added in Infra instead |
| 5 | Registry Foundation | ✅ PASSED | Must | 3 | `feat/slice-05-registry-foundation` | MODEL_REGISTRY, validation utils, 29 tests |
| 5+6 | Model Registry + bge-small | ✅ PASSED | Must | 5 | `feat/slice-05-06-model-registry` | 2nd model, UI selector, multi-model search |
| 7 | Sliding Window Chunking | ✅ PASSED | Should | 5+6 | `feat/slice-07-sliding-window` | stride-based chunking, 9 tests, 6 total methods |
| Infra | Project Hardening | ✅ PASSED | Must | 1 | `feat/slice-infra-hardening` | CI parity, gitleaks, Docker deploy, doc hub, 81 tests |
| 8 | Markdown-Aware Chunking | 📋 PLANNED | Should | 7, Infra | — | Split on headers; preserve code blocks and list boundaries |
| 9 | MMR Retrieval | 📋 PLANNED | Should | 8 | — | Maximal Marginal Relevance diversity weighting |
| 10 | Third Model (GTE-small) | 📋 PLANNED | Could | 5+6 | — | Registry extensibility test |
| 11 | Fourth Model (E5 Multilingual) | 📋 PLANNED | Could | 10 | — | Cross-language embedding support |
| 12 | Side-by-Side View | 📋 PLANNED | Should | 9 | — | Chunk comparison UI across collections |
| 13 | Experiment Diff | 📋 PLANNED | Should | 12 | — | Parameter comparison across experiment runs |
| 14 | Scoring View + Golden Dataset | 📋 PLANNED | Should | 13 | — | Evaluation metrics; golden dataset upload |
| 15 | Export/Import | 📋 PLANNED | Could | 14 | — | JSON snapshot sharing of experiments |

---

## State Machine

`📋 PLANNED → 🔨 IN PROGRESS → 🔀 ON BRANCH → ✅ PASSED | 🔴 BLOCKED | 📦 DEFERRED`

**Branch naming**: `slice/<N>-<kebab-name>` (e.g. `slice/8-markdown-chunking`)

---

## Quality Baseline (post-Infra, 2026-05-28)

| Gate | Baseline |
|------|----------|
| ESLint | 0 errors, 0 warnings (`--max-warnings 0`) |
| lint:meta | shellcheck + actionlint + markdownlint pass |
| format:check | Prettier clean (TS/JSON/YAML/HTML) |
| typecheck | 0 errors |
| tests | 81/81 passing |
| coverage | ~72% lines (`services/**`); 40% enforced threshold |
| npm audit | 0 high/critical |
| build | ~3.2s clean |

---

## Next Actions

1. ✅ Harness YAML embedded (2026-10-14) — see `Original Material` block above
2. ✅ DECISION-OWNERSHIP.md filled (2026-10-14) — ceilings, model registry, Slice 4 trigger, complexity mode
3. **Start Slice 8** — stub ready at `docs/plan/slices/slice-8-markdown-chunking.md`; create branch `slice/8-markdown-chunking`
4. Optional: tag `v0.8.0` after Infra + doc hub confirmed on `main`

---

## Gate Evidence

Gate evidence files live in `docs/plan/gate-evidence/slice-N.json`.
Merged slices have `PENDING_VERIFICATION` placeholders — executors must rewrite with full schema before any future `ON BRANCH → PASSED` transition.
