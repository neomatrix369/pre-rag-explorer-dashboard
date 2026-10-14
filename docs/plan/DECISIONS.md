# Decisions — Pre-RAG Explorer Dashboard

> Created by plan-health-check (EFP audit/reconcile migration) on 2026-10-13.
> One row per structural planning decision. Technical/implementation decisions in `docs/_internal/PROGRESS.md` Decision Log.

| Date | Context | Decision | Reason | Result |
|------|---------|----------|--------|--------|
| 2026-10-13 | health-check | Gap 1: interview_summary.md reconstructed | No prior EFP session; reconstructed from existing artifacts | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 2: Routing fingerprint added to TRAIL.md | Inferred from codebase + PROGRESS history | AUTO-FIXED |
| 2026-10-13 | skill-proposer | harness-scout degraded | First EFP session; model split confirmed without harness YAML embed. Run `/skill-proposer` Steps 6c/6d to embed. | USER-CONFIRMED |
| 2026-10-13 | health-check | Gap 4: Depends-on column added to TRAIL.md | Defaulted from PROGRESS.md merge history | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 5: gate-evidence/ PENDING_VERIFICATION placeholders for slices 1–7+Infra | Backfilled; NOT valid PASS evidence — executors must rewrite | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 7: DECISIONS.md created | First EFP session | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 10: Context preamble (Session bootstrap / Context / Non-goals / Output contract) inserted in all PLANNED slice stubs (8–15) | EFP mandatory for Must/Should stubs before execution | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 8: Coverage gates inserted in PLANNED slice stubs (8–15) | Required by EFP quality standards | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 9: Complexity-evidence policy placeholder added in PLANNED slice stubs | TBD — verify from existing quality tooling (scripts/complexity-report.sh) | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 11: invariants.md created from existing artifacts | Populated from TRAIL.md + PROGRESS.md + CLAUDE.md | AUTO-FIXED |
| 2026-10-13 | health-check | Gap 12: DECISION-OWNERSHIP.md skeleton created | Owners/ceilings require USER_FIX before execution | AUTO-FIXED (skel) |
| 2026-10-13 | structural | docs/ folder migrated to EFP standard layout | docs/plan/ created; docs/slices/ kept as historical archive | USER-CONFIRMED |
| 2026-04-19 | Slice 1 | Coverage 12% baseline | Only 1 service tested; incremental approach | IMPLEMENTED |
| 2026-04-19 | Slice 1 | ESLint warnings mode | Defer cleanup to Slice 2 | IMPLEMENTED |
| 2026-04-19 | Slice 1 | protobufjs override to 7.5.5 | Fix critical vuln in transformers dependency chain | IMPLEMENTED |
| 2026-04-19 | Slice 1 | Upgrade dev deps (vitest 1→4, eslint 6→8) | Comprehensive security; major upgrades succeeded without breaks | IMPLEMENTED |
| 2026-04-21 | Slice 3 | Mock transformers.js pipeline in tests | Avoid loading 23MB model; returns correct 384-dim shape | IMPLEMENTED |
| 2026-04-21 | Slice 3 | fake-indexeddb for test env | jsdom lacks IndexedDB | IMPLEMENTED |
| 2026-04-21 | Slice 3 | Coverage threshold 40% (not 71% actual) | Conservative safety margin | IMPLEMENTED |
| 2026-04-21 | Slice 5 | Single registry file constants/modelRegistry.ts | Simple for 2–4 models; can split later | IMPLEMENTED |
| 2026-04-21 | Slice 5 | Re-export from constants.tsx | Backward-compatible imports | IMPLEMENTED |
| 2026-04-21 | Slice 5+6 | Combine registry + 2nd model | Validates extensibility in one PR | IMPLEMENTED |
| 2026-04-23 | Slice 7 | ?? over \|\| for stride param | stride=0 is falsy; \|\| would use default | IMPLEMENTED |
| 2026-04-23 | Slice 7 | SLIDING_WINDOW as separate method | Different mental model (stride vs overlap) | IMPLEMENTED |
| 2026-05-27 | Infra | Inherit hardening from price-analysis + rag-params-finder | quality-gates.sh CI mirror, gitleaks in CI, Dependabot, CHANGELOG, ADR | IMPLEMENTED |
| 2026-05-27 | Infra | Docker static deploy (Infra not Slice 4) | Single-service nginx; ADR-001 unchanged | IMPLEMENTED |
| 2026-05-28 | Infra | @testing-library/react ^16.1 | React 19 peer deps; drop --legacy-peer-deps | IMPLEMENTED |
| 2026-05-28 | Infra | Doc hub layout | QUICKSTART + README hub; docs/user-guide/; PROGRESS → docs/_internal/ | IMPLEMENTED |
