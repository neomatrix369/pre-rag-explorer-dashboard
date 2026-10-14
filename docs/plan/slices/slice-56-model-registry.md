# Slice 5+6 — Model Registry + Second Model

> **Status**: ✅ PASSED | **MoSCoW**: Must | **Branch**: `feat/slice-05-06-model-registry` | **PR**: #10 | **Merged**: 2026-04-23
> **Historical detail**: `docs/slices/SLICE-05-06-MODEL-REGISTRY.md`
> **Gate evidence**: `docs/plan/gate-evidence/slice-56.json` (PENDING_VERIFICATION placeholder)

## Context

- **Stage objective**: Extend MODEL_REGISTRY to support a second embedding model and wire multi-model selection throughout the UI.
- **Depends on**: Slice 5 (registry foundation)
- **Global invariants**: → `docs/plan/invariants.md`

## What Was Delivered

- `constants/modelRegistry.ts` — 2 models: `all-MiniLM-L6-v2`, `bge-small-en-v1.5`
- `embeddingService.ts` — `modelId` parameter, pipeline switching, validation
- `ProcessSection.tsx` — model selector dropdown + parameter tooltips
- `SearchSection.tsx` — multi-model search (collections grouped by model)
- `VectorCollection.embeddingModel` — required metadata field

## Exit Criteria (All Met)

- [x] 2 models in registry with metadata
- [x] UI model selector with tooltips
- [x] Multi-model search working
- [x] 66/66 tests passing; ~70% coverage; build clean

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Combine Slices 5+6 | Validates extensibility in one vertical slice |
| Registry reconcile commit (f938a7a) | Align MODEL_REGISTRY after merge |
