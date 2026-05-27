# Slice Infra: Project Hardening & CI Parity

**Status**: 🔍 PR REVIEW  
**Branch**: `feat/slice-infra-hardening` | **Commit**: `ce2d086`  
**Priority**: Must (cross-cutting reliability)  
**MoSCoW**: Must — local/CI parity and contributor hygiene before feature slices 8+  
**Sources**: Patterns inherited from `price-analysis` and `rag-params-finder`

---

## Goal

Close gaps between local development, CI, and sibling-project best practices so every contributor runs the same gates and secrets/docs hygiene is enforced consistently.

**Maturity Profile**: Serious (extends Slice 1 toolchain)  
**20-Factor Compliance**: Factor 2 (Dependencies — Dependabot), Factor 3 (Config — `.env.example`), Factor 14 (Telemetry/docs baselines)

---

## Problem Statement

| Gap | Risk |
|-----|------|
| No unified quality script | Local runs differ from CI (format/audit skipped) |
| Prettier not in CI | Format drift merges despite lint-staged |
| gitleaks optional locally only | Secrets can reach remote without CI gate |
| No `.env.example` | Undocumented env contract |
| No CHANGELOG / ADR / contributor guide | Decisions and release history not traceable |
| No Dependabot | Stale deps and Actions versions |

---

## Scope (Must)

### 1. CI/local parity — `scripts/quality-gates.sh`

Mirror `.github/workflows/ci.yml` exactly:

1. lint → 2. format:check → 3. typecheck → 4. test → 5. test:coverage → 6. npm audit → 7. build

Add `--quick` flag (lint + format + typecheck + test only).

### 2. CI enhancements

- Add `npm run format:check` step
- Add `gitleaks/gitleaks-action@v2` secret scan

### 3. npm scripts

- `quality-gates` → `bash scripts/quality-gates.sh`
- `verify` → typecheck + build
- Expand `test:all` to include `format:check`

### 4. Git hooks

- Optional `.pre-commit-config.yaml` (Serious-lite hygiene + gitleaks, complements Husky)

### 5. Repository hygiene

- `.env.example` — optional `GEMINI_API_KEY`
- `.editorconfig` — shared indent/EOL
- `.github/dependabot.yml` — weekly npm + GitHub Actions
- `CHANGELOG.md` — Keep a Changelog, `[Unreleased]` section
- `docs/adr/ADR-001-browser-only-architecture.md`
- `docs/contributor-guide/development.md` — setup, gates, slice playbook

### 6. Documentation sync

- `README.md` — contributor link, quality-gates command, test count
- `CLAUDE.md` — quality gate entry points
- `docs/slices/PROGRESS.md` — slice row + decision log entry

---

## Out of Scope (Won't — separate slices)

| Item | Target |
|------|--------|
| TypeScript `strict` mode | Future infra slice |
| Playwright E2E | Slice 7+ manual / future |
| CodeQL / Trivy | Optimal tier — future |
| Cloudflare deploy | Slice 4 (parked) |
| Semver release script | When shipping tagged releases |

---

## Files

### Created

| Path | Purpose |
|------|---------|
| `scripts/quality-gates.sh` | CI mirror orchestrator |
| `.env.example` | Env var template |
| `.editorconfig` | Editor consistency |
| `.github/dependabot.yml` | Dependency automation |
| `.pre-commit-config.yaml` | Optional pre-commit framework |
| `CHANGELOG.md` | Release history |
| `docs/adr/ADR-001-browser-only-architecture.md` | Architecture decision |
| `docs/contributor-guide/development.md` | Contributor onboarding |

### Modified

| Path | Change |
|------|--------|
| `.github/workflows/ci.yml` | format:check + gitleaks |
| `package.json` | quality-gates, verify, test:all |
| `README.md` | Contributing + gates |
| `CLAUDE.md` | Gate commands |
| `docs/slices/PROGRESS.md` | Slice tracking |

---

## Acceptance Criteria

- [x] `./scripts/quality-gates.sh` exits 0 locally
- [x] `./scripts/quality-gates.sh --quick` exits 0 locally
- [x] CI workflow includes format:check and gitleaks steps
- [x] `npm run quality-gates` delegates to script
- [x] `npm run test:all` includes format:check
- [x] `.env.example` documents optional Gemini key
- [x] CHANGELOG, ADR-001, contributor guide exist and are linked from README
- [x] PROGRESS.md lists Infra slice with decision log entry
- [x] No prior tests regressed (81/81 passing)

---

## Verification Commands

```bash
# Full gates (matches CI)
./scripts/quality-gates.sh

# Quick pre-commit check
./scripts/quality-gates.sh --quick
```

**Expected baselines (2026-05-27):**

| Gate | Expected |
|------|----------|
| lint | 0 errors, 0 warnings |
| format:check | clean |
| typecheck | 0 errors |
| test | 81 passing |
| coverage | ≥40% on `services/**` (~72% actual) |
| npm audit | 0 high+ |
| build | success, ~3s |

---

## Implementation Plan

### Phase 1 — Script + CI parity
1. Add `scripts/quality-gates.sh` with `set -euo pipefail`
2. Wire npm scripts
3. Extend CI with format:check + gitleaks

### Phase 2 — Hooks + secrets
1. Add optional `.pre-commit-config.yaml`

### Phase 3 — Docs + automation
1. CHANGELOG, ADR, contributor guide
2. Dependabot, `.env.example`, `.editorconfig`
3. Sync README, CLAUDE, PROGRESS

### Phase 4 — Verify + commit
1. Run full quality gates
2. Conventional commit on `feat/slice-infra-hardening`

---

## Decision Log (slice-specific)

| Decision | Rationale |
|----------|-----------|
| Infra slice unnumbered (not Slice 8) | Avoid renumbering feature roadmap 8–15 |
| Husky + optional pre-commit | Husky handles lint-staged; pre-commit adds YAML/JSON hygiene without duplicating ESLint |
| gitleaks in CI not just local | price-analysis had bandit local-only; CI gap caused drift |
| ADR-001 mirrors rag-params-finder ADR-001 | Documents intentional browser-only vs two-process tradeoff |
| `--quick` on quality-gates | Fast feedback during active coding; full gates before push |

---

## References

- `price-analysis`: `scripts/check_integrity.py`
- `rag-params-finder`: `.pre-commit-config.yaml`, `docs/contributor-guide/development.md`, CHANGELOG cadence
- Slice 1 spec: `docs/slices/SLICE-01-TOOLCHAIN.md`

---

## Cross-check matrix (3 projects — 2026-05-27)

| Pattern | price-analysis | rag-params-finder | pre-rag (after slice) |
|---------|----------------|-------------------|------------------------|
| Unified quality script | `check_integrity.py` | `quality-gates.sh` | ✅ both patterns merged |
| CI/local parity | ❌ CI thin | ✅ split jobs | ✅ full mirror + gitleaks |
| Pre-commit hygiene | ✅ rich Python | ✅ Serious-lite | ✅ Husky + optional pre-commit |
| Gitleaks + config | local only | pre-commit | ✅ Husky + CI + `.gitleaks.toml` |
| Import smoke gate | ✅ test_import_smoke | ✅ check_integrity | ✅ importSmoke.test.ts |
| Progress dashboard | ✅ print_migration_progress | PROGRESS.md | ✅ print_slice_progress.sh |
| Lettered gates A–G | ✅ IN_PROGRESS | — | ✅ A–F in development.md |
| Benchmarks + baselines | ✅ benchmarks/ | — | ✅ scaffold (scripts TBD) |
| ADR + CHANGELOG | partial | ✅ | ✅ |
| Release automation | — | ✅ release.sh | ✅ release-process.md (script TBD) |
| Dependabot | — | ✅ | ✅ |
| `.gitattributes` | — | ✅ | ✅ |
| Frontend tests (Vitest) | N/A | ❌ | ✅ **ahead** (81 tests) |
| ESLint strict CI | N/A | partial | ✅ **ahead** |
| Docker deploy | ✅ Streamlit | deferred | Slice 4 parked |

### Still Won't (correct for browser-only)

- Python ruff/mypy/pytest toolchain
- Two-process FastAPI + CLI architecture
- price-analysis thin CI (would regress)
- Xenon/ESLint complexity on legacy chunkingService (until refactor slice)
- `release.sh` automation (Could — when tagging starts)
