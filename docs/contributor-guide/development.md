# Development Guide

![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=githubactions&logoColor=white)

Dev environment setup, quality gates, testing strategy, and slice workflow for contributors.

---

## Setup

```bash
# Node 20+ (see .nvmrc)
nvm use

# Install (React 19 peer-dep compatibility)
npm install --legacy-peer-deps

# Optional: Gemini integration
cp .env.example .env.local
# Edit GEMINI_API_KEY if needed — core RAG does not require it

# Start dev server
npm run dev    # → http://localhost:3000
```

### Git hooks (Husky — installed via `npm install`)

| Hook | Runs |
|------|------|
| `pre-commit` | gitleaks (if installed) + lint-staged (ESLint fix + Prettier) |
| `commit-msg` | Strips AI `Co-authored-by` trailers (Cursor/Claude) |

### Optional: pre-commit framework

For hygiene + gitleaks without Husky duplication:

```bash
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit run --all-files
```

ESLint/Prettier on staged files remain Husky + lint-staged; pre-commit adds YAML/JSON checks and standardized gitleaks.

---

## Quality Gates

**Single command (matches CI exactly):**

```bash
./scripts/quality-gates.sh
```

Quick mode (lint + format + typecheck + test — skips coverage, audit, build):

```bash
./scripts/quality-gates.sh --quick
```

Full mode (CI mirror + gitleaks config + pre-commit all-files):

```bash
./scripts/quality-gates.sh --full
```

Fast integrity check between slices (tests + import smoke):

```bash
./scripts/check_integrity.sh
./scripts/check_integrity.sh --full   # + quality-gates + gitleaks + pre-commit
npm run slice-progress                # terminal progress dashboard
```

### Individual gates

| Gate | Command | Baseline (2026-05-27) |
|------|---------|------------------------|
| Lint | `npm run lint` | 0 errors, 0 warnings |
| Format | `npm run format:check` | Prettier clean |
| Type check | `npm run typecheck` | 0 errors |
| Tests | `npm run test` | 81 passing (incl. import smoke) |
| Coverage | `npm run test:coverage` | ≥40% on `services/**` (~72% actual) |
| Security | `npm audit --audit-level=high` | 0 high+ vulnerabilities |
| Build | `npm run build` | ~3s, `dist/` created |

### npm script shortcuts

```bash
npm run test:all       # lint + format:check + typecheck + test
npm run verify         # typecheck + build
npm run quality-gates  # full CI mirror via scripts/quality-gates.sh
npm run check-integrity
npm run slice-progress
```

---

## Migration integrity gates (A–F)

Lettered gates adapted from price-analysis; run before merging infra/feature slices:

| Gate | Check | Command |
|------|-------|---------|
| A | Unit tests | `npm run test` |
| B | Import smoke | `npm run test -- services/__tests__/importSmoke.test.ts` |
| C | Typecheck + build | `npm run verify` |
| D | Full CI mirror | `./scripts/quality-gates.sh` |
| E | Secrets | `gitleaks detect --config .gitleaks.toml --source . --no-git` |
| F | Pre-commit hygiene | `pre-commit run --all-files` (optional) |

Or: `./scripts/check_integrity.sh` (A+B) and `./scripts/check_integrity.sh --full` (A–F).

---

## Testing Strategy

| Tier | Location | Purpose |
|------|----------|---------|
| Fast unit | `services/**/*.test.ts`, `utils/**`, `constants/**` | Service logic with mocked I/O |
| Import smoke | `services/__tests__/importSmoke.test.ts` | Gate B — module load safety |
| Coverage scope | `services/**/*.ts` only (vitest.config.ts) | Enforced 40% threshold in CI |

**Patterns inherited from sibling projects:**

- Mock Transformers.js and IndexedDB at boundaries (`fake-indexeddb`)
- Parametrize edge cases (empty input, invalid params)
- Characterization-style tests before refactoring chunking logic

**Not yet covered:** React components, `utils/similarity.ts`, E2E browser flows (Slice 7+ manual checklist).

---

## Project Structure

```
pre-rag-explorer-dashboard/
├── services/           # fileParser, chunking, embedding, vectorStore
├── constants/          # modelRegistry, chunking defaults
├── utils/              # similarity, modelValidation
├── src/tests/          # Vitest setup (fake-indexeddb, jest-dom)
├── docs/
│   ├── slices/         # Slice specs + PROGRESS.md (source of truth)
│   ├── adr/            # Architecture Decision Records
│   └── contributor-guide/  # This directory
├── scripts/
│   ├── quality-gates.sh         # CI mirror (--quick, --full)
│   ├── check_integrity.sh       # fast regression + optional full
│   ├── print_slice_progress.sh  # terminal metrics dashboard
│   └── strip_ai_coauthor.py     # commit-msg hygiene
├── benchmarks/                  # perf baseline structure (scripts TBD)
└── .github/workflows/ci.yml
```

---

## Slice Execution Playbook

*(Adapted from rag-params-finder contributor guide)*

### Pre-slice checklist

```
[ ] Read docs/slices/PROGRESS.md — confirm current state and next slice
[ ] Read or create docs/slices/SLICE-XX-*.md
[ ] Run ./scripts/quality-gates.sh — zero regressions before starting
[ ] Note acceptance criteria — these are exit conditions
```

### During slice

- Log non-obvious decisions in `PROGRESS.md` Decision Log
- Update PROGRESS status after each major checkpoint
- Verify incrementally — do not batch all tests to the end

### Post-slice checklist

```
[ ] All acceptance criteria checked
[ ] ./scripts/quality-gates.sh passes
[ ] PROGRESS.md status updated (🔨 → 🔍 PR REVIEW → ✔️ MERGED)
[ ] CHANGELOG.md updated under [Unreleased]
[ ] Consider release: see [release-process.md](release-process.md)
```

### Interrupt recovery

See `docs/slices/PROGRESS.md` § Interrupt Recovery — resume from last checkpoint without re-reading entire history.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) on push/PR to `main`:

1. Node from `.nvmrc` → ESLint → Prettier → TypeScript → Vitest → Coverage → npm audit → Build
2. gitleaks secret scan

Dependabot opens weekly PRs for npm and GitHub Actions updates.

---

## Security

| Control | Where |
|---------|-------|
| gitleaks | Husky (`.gitleaks.toml`), CI, `--full` quality gates |
| eslint-plugin-security | ESLint CI + lint-staged |
| npm audit | CI (`--audit-level=high`) |
| `.env.example` | Documents optional keys; `.env.local` gitignored |
| protobufjs override | `package.json` — CVE remediation (Slice 1 security) |

---

## AI-assisted development (optional)

Some contributors use **code-review-graph** MCP for impact analysis. See `AGENTS.md` and `CLAUDE.md`. Not required to run or test the app.

---

## See Also

- [Architecture](architecture.md) — module map and data flow
- [Release Process](release-process.md) — semver and tagging
- [ADR-001: Browser-Only Architecture](../adr/ADR-001-browser-only-architecture.md)
- [PROGRESS.md](../slices/PROGRESS.md) — slice status and decision log
- [CHANGELOG.md](../../CHANGELOG.md) — release history
- [README.md](../../README.md) — user-facing quick start
