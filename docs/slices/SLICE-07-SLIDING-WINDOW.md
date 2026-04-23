# Slice 7: Sliding Window Chunking

**Branch**: `feat/slice-07-sliding-window`  
**Status**: 🔨 IN PROGRESS  
**Started**: 2026-04-23

---

## Goal

Add SLIDING_WINDOW as a distinct chunking method with stride-based parameterization. While FIXED method uses overlap, SLIDING_WINDOW uses stride (step size), providing an alternative mental model for users.

**Key Difference:**
- **FIXED**: "Chunk size 1000, overlap 200" (chunks overlap by 200 chars)
- **SLIDING_WINDOW**: "Window size 1000, stride 800" (window moves 800 chars each step)

Both produce the same result for equivalent params, but stride is clearer for some use cases (e.g., "75% overlap" = "stride of 25% window size").

---

## Research Phase (15 min)

### Questions to Answer

1. **What's the difference from FIXED?**
   - FIXED uses `chunkSize` + `overlap` parameters
   - SLIDING_WINDOW uses `windowSize` + `stride` parameters
   - stride = chunkSize - overlap (mathematically equivalent)
   - Different UX: stride is "how far to move" vs overlap is "how much to share"

2. **Are there compatibility issues?**
   - No dependencies to upgrade
   - Uses existing ChunkParams interface (add windowSize, stride fields)
   - No breaking changes to existing methods

3. **What are realistic baseline metrics?**
   - Current: 66 tests passing, 71.42% coverage
   - Target: +8-10 tests for sliding window (unit tests for edge cases)
   - Coverage should maintain or improve slightly

4. **What could go wrong?**
   - Risk 1: Stride > windowSize (creates gaps) — need validation
   - Risk 2: Stride = 0 (infinite loop) — need validation
   - Risk 3: User confusion between FIXED and SLIDING_WINDOW — need clear docs/tooltips
   - Risk 4: Edge cases (empty text, stride = windowSize, stride = 1) — need tests

5. **Fallback plan?**
   - If implementation is too similar to FIXED, consolidate and add stride param to FIXED instead
   - If users find it confusing, we can remove SLIDING_WINDOW in future slice

### Compatibility Matrix

| Component | Impact | Notes |
|-----------|--------|-------|
| types.ts | Minor | Add windowSize, stride to ChunkParams |
| chunkingService.ts | Medium | Add slidingWindowChunk function + switch case |
| ProcessSection.tsx | Medium | Add SLIDING_WINDOW to method dropdown |
| constants.tsx | Minor | Add default params for SLIDING_WINDOW |
| Tests | High | New test file or extend existing chunking tests |

### Known Issues

- None (no dependency upgrades, pure feature addition)

---

## Implementation Plan

### Phase 1: Types & Constants (5 min)

**Files to Modify:**
- `types.ts` — Add SLIDING_WINDOW to ChunkingMethod enum
- `types.ts` — Add windowSize, stride to ChunkParams interface
- `constants.tsx` — Add default params (windowSize: 1000, stride: 500)

**Verification:**
```bash
npm run typecheck  # Should pass (no breaking changes)
```

### Phase 2: Core Implementation (15 min)

**Files to Modify:**
- `services/chunkingService.ts` — Add slidingWindowChunk function
- `services/chunkingService.ts` — Add SLIDING_WINDOW case to switch statement

**Implementation Details:**
```typescript
function slidingWindowChunk(text: string, windowSize: number, stride: number): string[] {
  // Validation
  if (stride <= 0) throw new Error('Stride must be positive');
  if (stride > windowSize) {
    console.warn('Stride > windowSize creates gaps between chunks');
  }
  
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + windowSize));
    i += stride;
    if (i >= text.length) break;
  }
  return chunks;
}
```

**Verification:**
```bash
npm run typecheck  # Should pass
npm run lint       # Should pass
```

### Phase 3: Tests (20 min)

**Files to Create or Modify:**
- `services/__tests__/chunkingService.test.ts` — Add sliding window tests

**Test Cases:**
1. Basic sliding window (windowSize=100, stride=50)
2. No overlap (stride = windowSize)
3. High overlap (stride = windowSize / 4)
4. Edge case: stride = 1 (every character)
5. Edge case: stride > windowSize (gaps warning)
6. Edge case: empty text
7. Edge case: text shorter than window
8. Validation: stride <= 0 throws error

**Verification:**
```bash
npm run test              # All tests pass (66 → 74+)
npm run test:coverage     # Coverage maintained (71%+)
```

### Phase 4: UI Integration (15 min)

**Files to Modify:**
- `components/process/ProcessSection.tsx` — Add SLIDING_WINDOW to dropdown
- `components/process/ProcessSection.tsx` — Add windowSize, stride controls (conditional rendering)

**UI Changes:**
- Method dropdown: Add "Sliding Window" option
- Param inputs (shown when SLIDING_WINDOW selected):
  - Window Size (default 1000)
  - Stride (default 500)
  - Helper text: "Stride < Window Size creates overlap"

**Verification:**
```bash
npm run build        # Should build successfully
npm run dev          # Manual test in browser
```

### Phase 5: Documentation (10 min)

**Files to Modify:**
- `README.md` — Add SLIDING_WINDOW to chunking methods list
- `components/upload/GuidanceBalloon.tsx` — Add sliding window description (if present)

**Documentation:**
- Describe stride vs overlap mental model
- Example: "Window size 1000, stride 750 = 25% overlap"
- When to use: "Use when thinking in terms of 'step size' rather than 'overlap amount'"

**Verification:**
```bash
npm run lint  # Check markdown/docs pass
```

---

## Exit Criteria

All must pass before commit:

- [ ] ChunkingMethod.SLIDING_WINDOW enum value added
- [ ] ChunkParams has windowSize, stride fields (both optional)
- [ ] slidingWindowChunk function implemented with validation
- [ ] 8+ tests added covering edge cases
- [ ] UI dropdown includes "Sliding Window" option
- [ ] Parameter inputs shown conditionally (windowSize, stride)
- [ ] All quality gates pass:
  - [ ] `npm run lint` (0 warnings)
  - [ ] `npm run typecheck` (0 errors)
  - [ ] `npm run test` (74+ tests passing)
  - [ ] `npm run test:coverage` (71%+ maintained)
  - [ ] `npm run build` (clean build)
- [ ] Manual browser test: Create collection with SLIDING_WINDOW
- [ ] README.md updated with new method
- [ ] PROGRESS.md updated with completion status

---

## Verification Commands

Run before commit:

```bash
# Quality gates
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build

# Manual verification
npm run dev
# 1. Upload a text file
# 2. Select "Sliding Window" method
# 3. Set windowSize=1000, stride=500
# 4. Process and verify chunks created
# 5. Check chunk overlap (each chunk should share 500 chars with next)
```

---

## Baseline Metrics (Pre-Slice 7)

```
Tests:          66 passing
Coverage:       71.42%
Build time:     ~2.8s
Lint warnings:  0
Type errors:    0
Vulnerabilities: 0 (high/critical)
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stride > windowSize creates gaps | 🟡 Medium | Validate and warn in UI tooltip |
| Stride = 0 causes infinite loop | 🔴 High | Validate stride > 0, throw error |
| User confusion (FIXED vs SLIDING_WINDOW) | 🟢 Low | Clear tooltips explaining difference |
| Code duplication (similar to FIXED) | 🟢 Low | Accept for now, can refactor later if needed |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Add as separate method (not modify FIXED) | Different mental model (stride vs overlap) serves different users |
| Validate stride > 0 | Prevent infinite loop |
| Warn on stride > windowSize | Valid but creates gaps; inform user without blocking |
| Default stride = windowSize/2 | 50% overlap is common RAG pattern |
| windowSize param (not reuse chunkSize) | Clear distinction from FIXED params |

---

## Time Estimate

- Research: 15 min (done)
- Implementation: 60 min
  - Types: 5 min
  - Core logic: 15 min
  - Tests: 20 min
  - UI: 15 min
  - Docs: 5 min
- Verification: 10 min
- **Total**: ~1.5 hours

---

## Next Slice

**Slice 8: Markdown-Aware Chunking**
- Split on headers (h1, h2, h3)
- Preserve code blocks
- Respect list boundaries
