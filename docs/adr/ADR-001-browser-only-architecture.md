# ADR-001: Browser-Only Architecture (No Backend)

**Status**: Accepted  
**Date**: 2026-04-19  
**Slice**: 1 — Toolchain / foundational design

---

## Context

The tool needs to parse documents, chunk text, embed vectors, store collections, and run retrieval experiments. Several architectural options exist:

1. **Browser-only**: All logic in the browser using WASM/ONNX models (Transformers.js) and IndexedDB.
2. **Two-process**: Thin client + FastAPI server + cloud vector DB (see [rag-params-finder ADR-001](https://github.com/)).
3. **Single-page + optional API**: Browser core with optional Gemini API for augmentation.

This dashboard is the **browser-only** variant — the inverse of the rag-params-finder two-process design.

---

## Decision

Use a **100% browser-based architecture**: React/Vite UI, in-browser Transformers.js embeddings, IndexedDB persistence, no server-side processing.

```
Upload → Parse → Chunk → Embed → IndexedDB → Search
         (all in browser; no network except model download)
```

---

## Rationale

| Concern | Browser-only advantage |
|---|---|
| Privacy | No document data leaves the machine |
| Setup | Single `npm run dev` — no MongoDB, no API keys for core RAG |
| Cost | No cloud DB or embedding API charges for experiments |
| Latency | No round-trip for chunk/search during exploration |
| Portability | Static build deployable to any static host (Slice 4) |

---

## Consequences

- **Model size limits** — large embedding models constrained by browser memory and download size.
- **No multi-user shared experiments** — collections are per-browser IndexedDB; export/import deferred to Slice 15.
- **No server-side secrets** — optional `GEMINI_API_KEY` is client-side only; must not be committed (`.env.example` + gitleaks).
- **IndexedDB quota** — users may hit browser storage limits with many large collections.

---

## Alternatives Considered

- **Two-process (rag-params-finder)**: Better for batch sweeps, Atlas Search, and keeping API keys server-side; rejected for this prototype's privacy and zero-infra goals.
- **Hybrid with local FastAPI**: Adds deployment complexity without benefit for single-user exploration.

---

## Related

- Slice 4 (Cloudflare Pages deploy) — static hosting only, no backend added
- Slice 15 (Export/Import) — mitigates per-browser isolation
