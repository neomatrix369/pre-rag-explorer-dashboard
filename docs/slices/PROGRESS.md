# Pre-RAG Explorer Dashboard — Build Progress

**Last Updated**: 2026-04-19 22:10  
**Current**: Slice 1 ✅ MERGED | Next: Slice 2

---

## Quick Status

| Slice | Status | Branch | Commit | Notes |
|-------|--------|--------|--------|-------|
| 1 — Toolchain | ✔️ MERGED | toolchain-setup | 39ed5b9 | ESLint, Prettier, Vitest, Husky, CI |
| 2 — Code Quality | 📋 NEXT | - | - | Remove 19 unused vars, tighten ESLint |
| 3 — Test Coverage | 📋 PLANNED | - | - | Add tests (embeddingService, fileParser, vectorStore) → 40%+ |
| 4 — Cloudflare Deploy | 📋 PLANNED | - | - | Headers, secrets, deploy workflow |
| 5 — Registry Foundation | 📋 PLANNED | - | - | MODEL_REGISTRY, validation patterns |
| 6 — Second Model (bge-small) | 📋 PLANNED | - | - | + Tooltips for params |
| 7 — Sliding Window Chunking | 📋 PLANNED | - | - | Stride-based overlap |
| 8 — Markdown-Aware Chunking | 📋 PLANNED | - | - | Split on headers, preserve structure |
| 9 — MMR Retrieval | 📋 PLANNED | - | - | Diversity weighting |
| 10 — Third Model (GTE-small) | 📋 PLANNED | - | - | Registry extensibility test |
| 11 — Fourth Model (E5 Multilingual) | 📋 PLANNED | - | - | Cross-language support |
| 12 — Side-by-Side View | 📋 PLANNED | - | - | Chunk comparison UI |
| 13 — Experiment Diff | 📋 PLANNED | - | - | Parameter comparison |
| 14 — Scoring View + Golden Dataset | 📋 PLANNED | - | - | Evaluation metrics |
| 15 — Export/Import | 📋 PLANNED | - | - | JSON snapshot sharing |

**Legend**: 📋 PLANNED | ⏳ READY | 🔨 IN PROGRESS | ✅ BUILT | 🔍 PR REVIEW | ✔️ MERGED

---

## Slice 1: Toolchain Foundation ✔️

**Branch**: `toolchain-setup` | **Commit**: `39ed5b9` | **Completed**: 2026-04-19

### Checkpoints
- [x] **PROMPT_READY** — Slice spec provided
- [x] **CODE_COMPLETE** — 11 files created, 4 modified
- [x] **TESTS_PASSING** — All verification passed (lint, typecheck, test, build)
- [x] **COMMITTED** — Single commit with toolchain foundation
- [x] **MERGED** — Merged to main (direct push on toolchain-setup branch)

### Verification Results
```bash
✅ npm install (with --legacy-peer-deps for React 19)
✅ npm run format
✅ npm run lint (78 warnings documented)
✅ npm run typecheck
✅ npm run test (3/3 passing)
✅ npm run test:coverage (12.87% baseline)
✅ npm run build (2.79s)
⚠️  gitleaks (not installed — hook warns gracefully)
```

### Key Decisions
| Decision | Rationale |
|----------|-----------|
| ESLint `no-unused-vars` = warn | 19 unused vars deferred to Slice 2 (code quality) |
| Coverage threshold: 12% | Baseline for 1 service tested; will increase incrementally |
| React 19 + legacy-peer-deps | @testing-library/react compatibility |
| Gitleaks conditional check | Skip if not installed, warn user to install |

### Outputs → Next Slices
- ✅ Pre-commit hooks active (lint-staged works)
- ✅ CI workflow template ready
- ✅ Test infrastructure established
- ✅ Security baseline (.gitignore, ESLint rules)

---

## Slice 2: Code Quality 📋

**Goal**: Clean up 78 ESLint warnings, tighten rules

### Files to Modify
- `App.tsx` — Remove 8 unused imports
- `components/layout/GuidanceBalloon.tsx` — Remove 2 unused vars
- `components/search/SearchSection.tsx` — Remove 3 unused imports
- `services/chunkingService.ts` — Remove 3 unused vars
- `services/fileParser.ts` — Remove 3 unused imports
- `.eslintrc.cjs` — Re-enable `--max-warnings 0`

### Verification
```bash
[ ] npm run lint (0 warnings)
[ ] npm run test (still 3/3)
[ ] npm run build
```

### Exit Criteria
- All 19 unused variable warnings resolved
- Security warnings reviewed (keep legitimate, suppress false positives inline)
- ESLint strict mode re-enabled

---

## Slice 3: Test Coverage 📋

**Goal**: Expand test coverage from 12% → 40%+

### Files to Create
- `services/embeddingService.test.ts`
- `services/fileParser.test.ts`
- `services/vectorStore.test.ts`

### Coverage Targets
```
embeddingService.ts: 40%+ (focus: singleton, batch processing)
fileParser.ts: 40%+ (focus: CSV, TXT parsing; skip PDF complexity)
vectorStore.ts: 40%+ (focus: CRUD operations, not IndexedDB internals)
```

### Verification
```bash
[ ] npm run test (12+ tests passing)
[ ] npm run test:coverage (≥40%)
```

### Exit Criteria
- Coverage threshold updated to 40% in `vitest.config.ts`
- All new tests passing
- CI green

---

## Interrupt Recovery

### Resume Checklist
1. Check `git status` for uncommitted work
2. Check current branch: `git branch --show-current`
3. Find last completed slice in table above
4. Check verification checkboxes for in-progress slice
5. Continue from next unchecked item

### Checkpoint Stages (per slice)
1. **PROMPT_READY** — Spec defined
2. **CODE_COMPLETE** — All files created/modified
3. **TESTS_PASSING** — Verification commands pass
4. **COMMITTED** — Git commit created
5. **MERGED** — Merged to main

---

## Decision Log

| Date | Slice | Decision | Why |
|------|-------|----------|-----|
| 2026-04-19 | 1 | Coverage 12% baseline | Only 1 service tested; incremental approach |
| 2026-04-19 | 1 | ESLint warnings mode | Defer cleanup to dedicated slice |
| 2026-04-19 | 1 | Gitleaks optional | Not npm-installable; graceful skip |
| 2026-04-19 | 1 | protobufjs override to 7.5.5 | Fix critical vuln in transformers dependency chain |
| 2026-04-19 | 1 | Upgrade dev deps (vitest 1→4, eslint 6→8) | Comprehensive security; major upgrades succeeded without breaks |
| 2026-04-19 | 1 | Upgrade transformers 2.16→2.17.2 | Latest patch, maintains API compatibility |
| 2026-04-19 | 1 | Full security audit (not --omit=dev) | Dev security matters; achieved 0 vulnerabilities |

---

## Blockers & Issues

| Slice | Issue | Severity | Status | Resolution |
|-------|-------|----------|--------|------------|
| 1 | gitleaks not in npm | 🟢 Minor | ✅ Resolved | Hook warns if missing |

**Severity**: 🔴 Blocker | 🟡 Workaround exists | 🟢 Minor

---

## Next Actions

**Immediate**:
1. ✅ Commit this progress tracker
2. ⏳ Define Slice 2 spec (code quality)
3. ⏳ Execute Slice 2

**Pipeline**:
- Slice 2: Code quality (remove warnings)
- Slice 3: Test coverage (40%+)
- Slice 4: Cloudflare deploy
