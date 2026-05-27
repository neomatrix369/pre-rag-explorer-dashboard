# Changelog

All notable changes to **pre-rag-explorer-dashboard** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

**For contributors**: Add entries under `## [Unreleased]` as you work. Move items to a version section when tagging a release.

---

## [Unreleased]

### Added

- **Project hardening**: `scripts/quality-gates.sh` (CI mirror), `.env.example`, `.editorconfig`, Dependabot, optional `.pre-commit-config.yaml`, contributor development guide, ADR-001
- **Cross-check phase 2**: `check_integrity.sh`, `print_slice_progress.sh`, import smoke tests (81 total Vitest tests), `.gitattributes`, `--full` quality gates, architecture + release docs, benchmarks scaffold
- **Meta linters**: shellcheck (`scripts/*.sh`), actionlint (`.github/workflows/`), markdownlint-cli2 (`*.md`, excludes `.tessl/`), Prettier extended to YAML/HTML; Husky + CI + `npm run lint:meta`
- **Docker deploy (Infra)**: multi-stage `Dockerfile`, `docker-compose.yml`, nginx SPA config, `start-services.sh` / `stop-services.sh`, `scripts/docker-cleanup.sh`, `scripts/health-check.sh`; CI `docker build` smoke

### Fixed

- **CI gitleaks on PRs**: `fetch-depth: 0` on checkout so `gitleaks-action` can resolve base..head revision range

### Removed

- **commit-msg strip hook**: AI co-author trailer automation removed; contributor policy covers trailer discipline without a repo hook

---

## [0.7.0] - 2026-05-27 (Slice 7 — in PR review)

### Added

- **Sliding window chunking** — stride-based overlap parameters
- 9 new chunking tests (75 total)

---

## [0.6.0] - 2026-05-27 (Slice 5+6)

### Added

- **BGE Small EN v1.5** embedding model in registry (~33MB, 384-dim)
- Model metadata tooltips in Process view

### Changed

- Embedding model selection via centralized `MODEL_REGISTRY`

---

## [0.5.0] - 2026-05-27 (Slice 5)

### Added

- `constants/modelRegistry.ts` with validation helpers
- Model registry unit tests

---

## [0.3.0] - 2026-04-21 (Slice 3)

### Added

- Service test suite: fileParser, chunkingService, embeddingService, vectorStore
- Vitest coverage thresholds (40% on `services/**`)

---

## [0.2.0] - 2026-04-21 (Slice 2)

### Fixed

- Resolved 79 ESLint warnings → 0 (strict `--max-warnings 0`)

---

## [0.1.0] - 2026-04-19 (Slice 1)

### Added

- ESLint (security plugin), Prettier, Vitest, Husky + lint-staged
- GitHub Actions CI workflow
- Optional gitleaks pre-commit hook
