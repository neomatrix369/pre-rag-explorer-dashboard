# Slice 5+6: Model Registry + Second Model 📋

**Status**: 🔨 IN PROGRESS | **Branch**: `feat/slice-05-06-model-registry`  
**Started**: 2026-04-21

---

## Goal

**Combined Slice**: Build MODEL_REGISTRY foundation (Slice 5) AND add second embedding model (Slice 6) to test extensibility.

**Rationale**: Registry and first additional model are tightly coupled — building together validates both creation AND extensibility in one vertical slice.

---

## What to Build

### 1. MODEL_REGISTRY (Slice 5 Foundation)

Create `MODEL_REGISTRY` in `constants.tsx` with metadata schema:

```typescript
interface EmbeddingModelConfig {
  id: string;              // HuggingFace model ID (e.g., 'Xenova/all-MiniLM-L6-v2')
  name: string;            // Display name (e.g., 'MiniLM L6 v2')
  family: string;          // Model family (e.g., 'MiniLM', 'BGE')
  dimensions: number;      // Embedding dimensions (e.g., 384)
  sizeMB: number;         // Approximate browser model size in MB
  multilingual: boolean;   // Supports multiple languages
  description: string;     // One-line description
}

const MODEL_REGISTRY: Record<string, EmbeddingModelConfig> = {
  // Initial models here
};
```

### 2. Add Two Models

1. **Xenova/all-MiniLM-L6-v2** (existing, currently hardcoded)
   - Dimensions: 384
   - Size: ~23MB (quantized ONNX)
   - Family: MiniLM
   - Multilingual: No

2. **Xenova/bge-small-en-v1.5** (NEW - Slice 6)
   - Dimensions: 384
   - Size: ~33MB (estimated quantized)
   - Family: BGE
   - Multilingual: No
   - Note: Optimized for retrieval tasks
   - Source: [HuggingFace](https://huggingface.co/Xenova/bge-small-en-v1.5)

### 3. Update embeddingService.ts

- Accept `modelId` parameter in embedding functions
- Update EmbeddingPipeline singleton to support model switching
- Validate modelId against MODEL_REGISTRY
- Add model metadata to VectorCollection

### 4. Add Model Selector UI

Update `ProcessSection.tsx`:
- Replace hardcoded model display with dropdown selector
- Display selected model metadata (dimensions, size, family)
- Persist selection to localStorage
- Default to current model (all-MiniLM-L6-v2)

### 5. Add Parameter Tooltips (Slice 6 Secondary Goal)

Add tooltips to chunking parameter inputs in `ProcessSection.tsx`:
- **chunkSize**: "Number of characters per chunk (fixed/recursive)"
- **overlap**: "Character overlap between consecutive chunks"
- **tokenCount**: "Number of tokens per chunk (approximate)"
- **sentenceCount**: "Number of sentences to group per chunk"
- **similarityThreshold**: "Cosine similarity threshold for semantic grouping (0-1)"

Use simple title attribute or create `<InfoIcon>` component.

---

## Files to Create

1. **types.ts** — Add `EmbeddingModelConfig` interface (if not inline in constants)
2. **components/common/Tooltip.tsx** (optional) — Reusable tooltip component

## Files to Modify

1. **constants.tsx** — Add MODEL_REGISTRY, migrate GEMINI_MODEL to registry
2. **services/embeddingService.ts** — Add modelId parameter, validate against registry
3. **components/chunking/ProcessSection.tsx** — Add model selector, tooltips
4. **types.ts** — Ensure `VectorCollection.embeddingModel` is required (not optional)

## Files to Test

1. **services/__tests__/embeddingService.test.ts** — Test model switching, validation
2. **NEW: constants.test.ts** — Validate MODEL_REGISTRY schema
3. **Integration test**: Process same file with both models, verify different collections

---

## Research Phase (15 min)

### Model Specifications

| Model | Dimensions | Size (MB) | Family | Multilingual | Notes |
|-------|-----------|-----------|--------|--------------|-------|
| Xenova/all-MiniLM-L6-v2 | 384 | ~23 | MiniLM | No | Current default |
| Xenova/bge-small-en-v1.5 | 384 | ~33* | BGE | No | Optimized for retrieval |

\* Estimated from 460MB repo size; actual quantized ONNX will be smaller

### Compatibility Check

✅ Both models use 384 dimensions (no breaking changes to similarity functions)  
✅ Both are Xenova ONNX models (same API via Transformers.js)  
✅ No new dependencies required  
✅ Existing VectorCollection has `embeddingModel?: string` field

### Known Risks

1. **Model download time**: bge-small is ~33MB (10MB more than current). First load will take longer.
   - **Mitigation**: Show loading indicator, cache is persistent
2. **Model switching**: Collections from different models should NOT be compared directly
   - **Mitigation**: Filter search by model OR warn user if mixing models
3. **Backward compatibility**: Existing collections don't have embeddingModel field
   - **Mitigation**: Default to 'Xenova/all-MiniLM-L6-v2' if missing

---

## Verification Commands

```bash
# Pre-flight (establish baseline)
npm run lint           # Should pass (0 warnings from Slice 2)
npm run typecheck      # Should pass (0 errors)
npm run test           # 37/37 passing (from Slice 3)
npm run test:coverage  # 71.42% baseline (from Slice 3)

# Post-implementation (should still pass)
npm run lint
npm run typecheck
npm run test           # Should increase (new tests for registry + model switching)
npm run test:coverage  # Should maintain or increase
npm run build

# Manual testing
npm run dev
# 1. Select bge-small model, process a file
# 2. Switch to MiniLM, process same file
# 3. Verify two separate collections created
# 4. Search in both, verify results differ slightly
# 5. Check tooltips appear on parameter inputs
```

---

## Exit Criteria

- [x] **PROMPT_READY** — This spec complete
- [ ] **CODE_COMPLETE** — All files created/modified
- [ ] **TESTS_PASSING** — All verification commands pass
  - [ ] Lint: 0 warnings
  - [ ] Typecheck: 0 errors
  - [ ] Tests: All passing (new model registry tests added)
  - [ ] Coverage: ≥71% maintained
  - [ ] Build: Success
- [ ] **MANUAL_VERIFIED** — UI tested in browser
  - [ ] Model selector works
  - [ ] Both models can process files
  - [ ] Collections tagged with correct model
  - [ ] Tooltips visible and helpful
- [ ] **COMMITTED** — Single commit with detailed message
- [ ] **MERGED** — PR created and approved

---

## Success Metrics

**Functional**:
- ✅ Can select from 2 models
- ✅ Each model creates separate collection
- ✅ Collections include embeddingModel metadata
- ✅ Parameter tooltips visible on hover

**Technical**:
- ✅ No type errors
- ✅ No new ESLint warnings
- ✅ Test coverage ≥71%
- ✅ Registry validates model IDs
- ✅ Backward compatible with existing collections

**UX**:
- ✅ Model selection clear and discoverable
- ✅ Model metadata helps user choose
- ✅ Tooltips explain parameters without cluttering UI

---

## Decision Log (To Be Updated During Implementation)

| Decision | Rationale | Reversibility |
|----------|-----------|---------------|
| Combine Slices 5+6 | Test registry creation AND extensibility together | Easy (can still document separately) |
| Same dimensions (384) for both models | Avoids changes to similarity functions | N/A (models are 384 by design) |
| Model ID as primary key | HuggingFace ID is unique and portable | Medium (would require data migration) |
| localStorage for model selection | Consistent with existing param persistence | Easy (can switch to IndexedDB) |
| Default to existing model | Backward compatibility | Easy (can change default) |

---

## Next Slice Dependencies

**Slice 7** (Sliding Window Chunking): Needs registry for model tagging  
**Slice 10** (Third Model - GTE-small): Validates registry extensibility  
**Slice 11** (Fourth Model - E5 Multilingual): Tests multilingual flag in registry

---

## References

- [Xenova/bge-small-en-v1.5 on HuggingFace](https://huggingface.co/Xenova/bge-small-en-v1.5)
- [Xenova/all-MiniLM-L6-v2 on HuggingFace](https://huggingface.co/Xenova/all-MiniLM-L6-v2)
- Graphiti: `MODEL_REGISTRY` facts (search: "MODEL_REGISTRY constants.ts")
- Slice Execution Pattern: `~/.claude/rules/slice-execution.md`
