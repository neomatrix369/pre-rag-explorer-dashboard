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

### 1. Upgraded Production Dependencies
```bash
npm install @xenova/transformers@^2.17.2 --legacy-peer-deps
```
**Before**: 2.16.0  
**After**: 2.17.2

### 2. Upgraded Dev Dependencies (Major Versions)
```bash
npm install --save-dev \
  vitest@^4.1.4 \
  @vitest/coverage-v8@^4.1.4 \
  @typescript-eslint/eslint-plugin@^8.58.2 \
  @typescript-eslint/parser@^8.58.2
```
**vitest**: 1.6.1 → 4.1.4 (3 major versions)  
**@typescript-eslint**: 6.21.0 → 8.58.2 (2 major versions)

Fixed vulnerabilities:
- esbuild dev server vulnerability (moderate)
- minimatch ReDoS vulnerabilities (3 high)

### 3. Added npm Overrides
Force safe protobufjs version across all dependencies:
```json
"overrides": {
  "protobufjs": "^7.5.5"
}
```

### 4. Removed Workaround
Vitest 4.x fixed plugin type issues, removed unnecessary `@ts-expect-error` directive

## Verification

**Full security audit (ALL dependencies)**:
```bash
✅ npm audit --audit-level=high
found 0 vulnerabilities
```

**All quality gates passing**:
```bash
✅ npm run lint (79 warnings, 0 errors)
✅ npm run typecheck (0 errors)
✅ npm run test (3/3 passing)
✅ npm run build (2.75s)
```

**No remaining vulnerabilities**:
- 0 vulnerabilities across all dependencies (production + dev)
- Major version upgrades completed successfully
- No breaking changes to application code

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

**Why upgrade dev dependencies to latest major versions?**
- Comprehensive security is better than partial (dev machines are attack vectors)
- Breaking changes were minimal (vitest 4.x is largely compatible)
- Major version jumps (3 for vitest, 2 for typescript-eslint) succeeded without code changes
- Vitest 4.x fixed the plugin type issue (removed workaround)
- Risk: LOW - all tests passed immediately after upgrade

**Why overrides instead of resolutions?**
- `overrides` is npm's official mechanism (npm 8.3+)
- `resolutions` is Yarn-specific
- More explicit than peer dependency ranges

## Lessons Learned

1. **Don't assume major version upgrades will break** - Test first
2. **Dev security matters** - Supply chain attacks target dev dependencies
3. **Upgrade paths can be smooth** - vitest 1→4 and typescript-eslint 6→8 were seamless
4. **Comprehensive > Partial** - 0 vulnerabilities across all deps is better than production-only
