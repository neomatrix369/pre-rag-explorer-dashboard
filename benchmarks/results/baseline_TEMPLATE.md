# Performance Baseline Template

**Date**: YYYY-MM-DD  
**Commit**: `<sha>`  
**Node**: `<version from .nvmrc>`  
**Machine**: `<optional — e.g. M-series Mac, CI runner>`

## Chunking (fixed 50KB text fixture)

| Method | Mean (ms) | 2× threshold (investigate) |
|--------|-----------|----------------------------|
| FIXED | | |
| RECURSIVE | | |
| SLIDING_WINDOW | | |

## Retrieval (100 chunks, 384-dim vectors)

| Mode | Mean (ms) | 2× threshold |
|------|-----------|--------------|
| dense | | |
| sparse | | |
| hybrid | | |

## Regression rule

If any operation exceeds **2×** its baseline mean on the same fixture, investigate before merging.
