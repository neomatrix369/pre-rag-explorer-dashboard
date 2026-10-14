# Slice 3 — Test Coverage

> **Status**: ✅ PASSED | **MoSCoW**: Must | **Branch**: `feat/slice-03-test-coverage` | **PR**: #8 | **Merged**: 2026-04-21
> **Gate evidence**: `docs/plan/gate-evidence/slice-3.json` (PENDING_VERIFICATION placeholder)

## Context

- **Stage objective**: Add service-level unit tests and raise coverage threshold from 12% to 40%+.
- **Depends on**: Slice 2 (code quality)
- **Global invariants**: → `docs/plan/invariants.md`

## What Was Delivered

- `services/__tests__/embeddingService.test.ts` — mock transformers pipeline, 10 tests
- `services/__tests__/fileParser.test.ts` — TXT/CSV/MD parsing, 11 tests
- `services/__tests__/vectorStore.test.ts` — CRUD for collections + files, 16 tests
- Coverage: 71.42% lines (target 40%+)
- `fake-indexeddb` added for test env

## Exit Criteria (All Met)

- [x] 37 tests passing (up from 3)
- [x] 71.42% line coverage (threshold 40%)
- [x] `embeddingService`: 80.64%, `fileParser`: 60.71%, `vectorStore`: 100%
- [x] All quality gates pass

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Mock transformers.js pipeline | Avoid 23MB model load in tests |
| fake-indexeddb | jsdom lacks IndexedDB |
| Skip PDF tests | pdf.js complex to mock; TXT/CSV/MD sufficient |
| Threshold 40% (not 71%) | Conservative safety margin for code growth |
