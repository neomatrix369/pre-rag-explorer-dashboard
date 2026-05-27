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

### Individual gates

| Gate | Command | Baseline (2026-05-27) |
|------|---------|------------------------|
| Lint | `npm run lint` | 0 errors, 0 warnings |
| Format | `npm run format:check` | Prettier clean |
| Type check | `npm run typecheck` | 0 errors |
| Tests | `npm run test` | 75 passing |
| Coverage | `npm run test:coverage` | ≥40% on `services/**` (~72% actual) |
| Security | `npm audit --audit-level=high` | 0 high+ vulnerabilities |
| Build | `npm run build` | ~3s, `dist/` created |

### npm script shortcuts

```bash
npm run test:all       # lint + format:check + typecheck + test
npm run verify         # typecheck + build
npm run quality-gates  # full CI mirror via scripts/quality-gates.sh
```

---

## Testing Strategy

| Tier | Location | Purpose |
|------|----------|---------|
| Fast unit | `services/**/*.test.ts`, `utils/**`, `constants/**` | Service logic with mocked I/O |
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
│   ├── quality-gates.sh      # CI mirror
│   └── strip_ai_coauthor.py  # commit-msg hygiene
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
[ ] Conventional Commits with WHY not WHAT
```

### Interrupt recovery

See `docs/slices/PROGRESS.md` § Interrupt Recovery — resume from last checkpoint without re-reading entire history.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) on push/PR to `main`:

1. ESLint → Prettier check → TypeScript → Vitest → Coverage → npm audit → Build
2. gitleaks secret scan

Dependabot opens weekly PRs for npm and GitHub Actions updates.

---

## Security

| Control | Where |
|---------|-------|
| gitleaks | pre-commit (Husky), CI, optional pre-commit framework |
| eslint-plugin-security | ESLint CI + lint-staged |
| npm audit | CI (`--audit-level=high`) |
| `.env.example` | Documents optional keys; `.env.local` gitignored |
| protobufjs override | `package.json` — CVE remediation (Slice 1 security) |

---

## AI-assisted development (optional)

Some contributors use **code-review-graph** MCP for impact analysis. See `AGENTS.md` and `CLAUDE.md`. Not required to run or test the app.

---

## See Also

- [ADR-001: Browser-Only Architecture](../adr/ADR-001-browser-only-architecture.md)
- [PROGRESS.md](../slices/PROGRESS.md) — slice status and decision log
- [CHANGELOG.md](../../CHANGELOG.md) — release history
- [README.md](../../README.md) — user-facing quick start
