# Benchmarks

Performance baselines for browser RAG hot paths (pattern from `price-analysis/benchmarks/`).

| Script | Focus | Status |
|--------|-------|--------|
| `benchmark_chunking.ts` | All chunking methods on fixed fixture | Planned (Slice 8+) |
| `benchmark_similarity.ts` | Dense/sparse/hybrid on synthetic vectors | Planned |

## Running (when scripts exist)

```bash
npx tsx benchmarks/benchmark_chunking.ts
```

## Baseline results

Committed baselines live in `benchmarks/results/`. Each file records:

- Machine / Node version
- Git commit SHA
- Per-operation mean timing
- **2× mean = investigate** regression threshold

Template: [`results/baseline_TEMPLATE.md`](results/baseline_TEMPLATE.md)

## Notes

- Measure cold runs (clear caches between iterations where applicable).
- Transformers.js embedding benchmarks need network on first model load — use `--integration` tier or pre-cached models.
- Do not block fast CI; run benchmarks manually or in a scheduled workflow.
