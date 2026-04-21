# Slice 5: Registry Foundation

**Branch**: `feat/slice-05-registry-foundation`  
**Started**: 2026-04-21  
**Status**: IN PROGRESS

---

## Goal

Create MODEL_REGISTRY infrastructure to support multiple embedding models. This slice establishes the foundation without changing behavior (single model: all-MiniLM-L6-v2). Slice 6 will add the second model (bge-small).

---

## Motivation

**Current State:**
- Model ID hardcoded in `constants.tsx` (`GEMINI_MODEL = 'Xenova/all-MiniLM-L6-v2'`)
- Dimensions hardcoded (`EMBEDDING_DIMENSIONS = 384`)
- No validation or metadata
- Adding a second model would require scattered changes

**Target State:**
- Centralized MODEL_REGISTRY with model metadata
- Type-safe validation utilities
- Extensible structure (Slice 6 adds second model easily)
- All code uses registry (no behavior change)

---

## Design

### Model Registry Structure

```typescript
// constants/modelRegistry.ts
interface ModelConfig {
  id: string;                    // Unique identifier (e.g., 'all-minilm-l6-v2')
  name: string;                  // Display name (e.g., 'all-MiniLM-L6-v2')
  dimensions: number;            // Embedding dimensions (e.g., 384)
  huggingFaceId: string;         // HuggingFace model ID (e.g., 'Xenova/all-MiniLM-L6-v2')
  description: string;           // Human-readable description
  defaultParams?: {              // Default pipeline parameters
    pooling: 'mean' | 'cls';
    normalize: boolean;
  };
}

const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'all-minilm-l6-v2': {
    id: 'all-minilm-l6-v2',
    name: 'all-MiniLM-L6-v2',
    dimensions: 384,
    huggingFaceId: 'Xenova/all-MiniLM-L6-v2',
    description: 'Fast, general-purpose sentence embeddings (384 dimensions)',
    defaultParams: {
      pooling: 'mean',
      normalize: true,
    },
  },
  // Slice 6 will add: 'bge-small-en-v1.5'
};

const DEFAULT_MODEL_ID = 'all-minilm-l6-v2';
```

### Validation Utilities

```typescript
// utils/modelValidation.ts

/**
 * Validates model configuration object
 * @throws Error if invalid
 */
export function validateModelConfig(config: unknown): ModelConfig;

/**
 * Gets model by ID from registry
 * @throws Error if not found
 */
export function getModelById(id: string): ModelConfig;

/**
 * Gets default model from registry
 */
export function getDefaultModel(): ModelConfig;

/**
 * Checks if model ID exists in registry
 */
export function isValidModelId(id: string): boolean;

/**
 * Gets all model IDs from registry
 */
export function getAllModelIds(): string[];
```

### Type Updates

```typescript
// types.ts
export type ModelId = string; // Union type in Slice 6: 'all-minilm-l6-v2' | 'bge-small-en-v1.5'

export interface ModelConfig {
  id: string;
  name: string;
  dimensions: number;
  huggingFaceId: string;
  description: string;
  defaultParams?: {
    pooling: 'mean' | 'cls';
    normalize: boolean;
  };
}
```

---

## Implementation Plan

### Phase 1: Create Registry & Types
1. Create `constants/modelRegistry.ts` with single model
2. Update `types.ts` with ModelConfig, ModelId

### Phase 2: Create Validation Utilities
1. Create `utils/modelValidation.ts` with 5 functions
2. Add error handling for invalid IDs

### Phase 3: Refactor Existing Code
1. Update `constants.tsx` to re-export from registry
2. Verify no behavior changes (same model, same dimensions)

### Phase 4: Tests
1. Create `constants/__tests__/modelRegistry.test.ts` (5+ tests)
2. Create `utils/__tests__/modelValidation.test.ts` (5+ tests)

### Phase 5: Verification
1. Run all quality gates
2. Verify coverage maintained (71%+)
3. Manual smoke test (dev server)

---

## Files

### Created
- `constants/modelRegistry.ts` — Model registry
- `utils/modelValidation.ts` — Validation utilities
- `constants/__tests__/modelRegistry.test.ts` — Registry tests
- `utils/__tests__/modelValidation.test.ts` — Validation tests

### Modified
- `types.ts` — Add ModelConfig, ModelId types
- `constants.tsx` — Import from registry (re-export GEMINI_MODEL, EMBEDDING_DIMENSIONS)

---

## Exit Criteria

- [ ] MODEL_REGISTRY contains single model (all-minilm-l6-v2)
- [ ] ModelConfig type includes all required fields
- [ ] 5 validation utilities implemented
- [ ] All existing code uses registry (via constants.tsx re-exports)
- [ ] No behavior changes (same model loaded, same UI display)
- [ ] 10+ tests added (5 registry, 5 validation)
- [ ] npm run test → 47+ tests passing
- [ ] npm run test:coverage → 71%+ coverage maintained
- [ ] npm run lint → 0 warnings
- [ ] npm run typecheck → 0 errors
- [ ] npm run build → clean build
- [ ] Dev server runs without errors

---

## Testing Strategy

### Registry Tests (`constants/__tests__/modelRegistry.test.ts`)
1. MODEL_REGISTRY contains expected model
2. Default model ID is valid
3. Model has all required fields
4. Model dimensions are positive integer
5. HuggingFace ID follows expected format

### Validation Tests (`utils/__tests__/modelValidation.test.ts`)
1. validateModelConfig accepts valid config
2. validateModelConfig rejects invalid config
3. getModelById returns correct model
4. getModelById throws on invalid ID
5. getDefaultModel returns default model
6. isValidModelId returns true for valid ID
7. isValidModelId returns false for invalid ID
8. getAllModelIds returns all registry keys

---

## Verification Commands

```bash
# Quality gates
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build

# Manual verification
npm run dev  # Check UI displays model name correctly
```

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Single registry file | Simple for 2-4 models; can split later if needed |
| Validation utilities in separate file | Clear separation of concerns; easier to test |
| Re-export from constants.tsx | Minimize changes to existing imports |
| ModelId as string type | Will become union type in Slice 6 ('all-minilm-l6-v2' \| 'bge-small-en-v1.5') |
| Default params in config | Makes pipeline parameters explicit and testable |

---

## Next Slice

**Slice 6: Second Model (bge-small-en-v1.5)**
- Add second model to MODEL_REGISTRY
- Update ModelId to union type
- Add model selection UI (dropdown in ProcessSection)
- Add tooltips for chunking parameters
- Test with multiple models simultaneously

---

## Notes

- This slice is **foundation only** — no UI changes
- Behavior remains identical (single model workflow)
- Extensibility tested in Slice 6 (second model should be trivial to add)
- If adding second model requires significant refactoring, this slice design needs revision
