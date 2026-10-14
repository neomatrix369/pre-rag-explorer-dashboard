# Slice 7 — Sliding Window Chunking

> **Status**: ✅ PASSED | **MoSCoW**: Should | **Branch**: `feat/slice-07-sliding-window` | **PR**: #11 | **Merged**: 2026-05-27
> **Historical detail**: `docs/slices/SLICE-07-SLIDING-WINDOW.md`
> **Gate evidence**: `docs/plan/gate-evidence/slice-7.json` (PENDING_VERIFICATION placeholder)

## Context

- **Stage objective**: Add `SLIDING_WINDOW` as a 6th chunking method with stride-based parameterization distinct from the overlap-based `FIXED` method.
- **Depends on**: Slice 5+6 (model registry + UI patterns established)
- **Global invariants**: → `docs/plan/invariants.md`

## What Was Delivered

- `ChunkingMethod.SLIDING_WINDOW` enum value in `types.ts`
- `ChunkParams.windowSize`, `ChunkParams.stride` fields
- `slidingWindowChunk()` function in `chunkingService.ts` with `stride > 0` validation
- UI: window size + stride sliders with live overlap % tooltip in `ProcessSection.tsx`
- 9 new tests (edge cases: stride=0, stride=1, stride>window, empty text, short text)
- `README.md` updated to "6 Chunking Strategies"

## Exit Criteria (All Met)

- [x] `SLIDING_WINDOW` in `ChunkingMethod` enum
- [x] `windowSize`, `stride` in `ChunkParams`
- [x] `slidingWindowChunk()` with validation (throws on `stride ≤ 0`, warns on `stride > windowSize`)
- [x] 9 tests added; 75/75 total passing
- [x] UI dropdown + param inputs with tooltips
- [x] `README.md` updated
- [x] All quality gates pass (72.3% coverage maintained)

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Separate method (not modify FIXED) | Different mental model (stride vs overlap) |
| `??` not `\|\|` for stride param | `stride=0` is falsy; `\|\|` would use default |
| Show overlap % in tooltip | `overlap = windowSize - stride` — helps users understand |
