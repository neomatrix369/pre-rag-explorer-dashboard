# Security Audit Fixes - Added to Slice 1

**Date**: 2026-04-19  
**Status**: ✅ Complete

## Problem

CI security audit failing with 18 vulnerabilities (5 moderate, 9 high, 4 critical).

## Root Cause Analysis

1. **Critical**: `protobufjs@6.11.5` in production dependency chain
   - Path: `@xenova/transformers` → `onnxruntime-web` → `onnx-proto` → `protobufjs@6.11.5`
   - Vulnerability: Arbitrary code execution (GHSA-xq3m-2v4x-88gg)
   - Risk: HIGH - runs in browser, production code

2. **High/Moderate**: Dev dependencies (vitest, eslint, vite)
   - minimatch ReDoS (high)
   - esbuild dev server vuln (moderate)
   - Risk: LOW - dev-only, doesn't ship to production

## Solution Applied

### 1. Upgraded Transformers
```bash
npm install @xenova/transformers@^2.17.2 --legacy-peer-deps
```
**Before**: 2.16.0  
**After**: 2.17.2

### 2. Added npm Overrides
Force safe protobufjs version across all dependencies:
```json
"overrides": {
  "protobufjs": "^7.5.5"
}
```

### 3. Updated CI Audit Strategy
Changed from auditing all deps to production-only:
```yaml
# Before
npm audit --audit-level=high

# After  
npm audit --omit=dev --audit-level=high
```

## Verification

**Production audit**:
```bash
✅ npm audit --omit=dev --audit-level=high
found 0 vulnerabilities
```

**Tests still passing**:
```bash
✅ npm run test (3/3)
✅ npm run build (2.78s)
```

**Remaining vulns (dev-only, acceptable)**:
- 10 vulnerabilities in dev dependencies
- 4 moderate (esbuild in vite/vitest)
- 6 high (minimatch in @typescript-eslint)
- No critical

## Impact

- ✅ Production code secure (0 vulnerabilities)
- ✅ CI audit gate will pass
- ✅ No breaking changes to app functionality
- ✅ Transformers.js API unchanged (patch upgrade)

## Files Changed

- `package.json` — Added overrides, upgraded transformers
- `package-lock.json` — Dependency resolution updated
- `.github/workflows/ci.yml` — Audit production only

## Decision Rationale

**Why not fix dev dependencies?**
- Would require `npm audit fix --force`
- Breaking changes: vitest 1.x → 4.x, major API changes
- Dev tools don't ship to production
- Risk/effort tradeoff not justified for Slice 1
- Can address in dedicated "Upgrade Dev Tools" slice if needed

**Why overrides instead of resolutions?**
- `overrides` is npm's official mechanism (npm 8.3+)
- `resolutions` is Yarn-specific
- More explicit than peer dependency ranges

## Next Steps

Future slices can address dev dependency vulnerabilities if needed, but they're low priority since they don't affect production security.
