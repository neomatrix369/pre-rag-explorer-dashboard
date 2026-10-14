# Slice Infra — Project Hardening

> **Status**: ✅ PASSED | **MoSCoW**: Must | **Branch**: `feat/slice-infra-hardening` | **PR**: #20 | **Merged**: 2026-05-28
> **Historical detail**: `docs/slices/SLICE-INFRA-HARDENING.md`
> **Gate evidence**: `docs/plan/gate-evidence/slice-infra.json` (PENDING_VERIFICATION placeholder)

## Context

- **Stage objective**: Close gaps between local development and CI; add secrets scanning, meta linters, Docker static deploy, and doc hub.
- **Depends on**: Slice 1 (toolchain)
- **Global invariants**: → `docs/plan/invariants.md`

## What Was Delivered

- `scripts/quality-gates.sh` — CI mirror (ESLint → shellcheck → actionlint → markdownlint → Prettier → typecheck → test → coverage → audit → build → gitleaks)
- `scripts/lint-meta.sh`, lint-staged wrappers for shell/workflow files
- `.markdownlint-cli2.yaml` — Markdown lint config
- CI: format:check, shellcheck, actionlint, markdownlint, gitleaks steps added
- Husky: lint-staged + optional pre-commit meta hooks
- `.env.example`, `.editorconfig`, `.github/dependabot.yml`
- `CHANGELOG.md`, `docs/adr/ADR-001-browser-only-architecture.md`
- Contributor guide: `docs/contributor-guide/development.md`
- Docker: `Dockerfile` (Vite build → nginx), `docker-compose.yml`, `start-services.sh`, `stop-services.sh`
- Doc hub: `docs/user-guide/`, `docs/_internal/PROGRESS.md`, `QUICKSTART.md`
- `@testing-library/react ^16.1` — React 19 peer deps; dropped `--legacy-peer-deps`
- 81/81 tests (added import smoke tests)

## Exit Criteria (All Met)

- [x] `./scripts/quality-gates.sh` exits 0
- [x] CI includes format:check, gitleaks, shellcheck, actionlint, markdownlint
- [x] Docker: `./start-services.sh` → app at `http://localhost:3000`
- [x] 81/81 tests passing (incl. import smoke)
- [x] No prior tests regressed

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Infra slice unnumbered | Avoid renumbering feature roadmap 8–15 |
| Husky + optional pre-commit | Husky for lint-staged; pre-commit pins meta linters |
| shellcheck-py | Official hook requires Docker; shellcheck-py works in CI |
| markdownlint not Prettier on `*.md` | Avoid mass-reformat of historical docs |
| Docker as Infra extension | Slice 4 CF still parked; Docker is static hosting only |
