# Slice 4 — Cloudflare Deploy

> **Status**: 📦 DEFERRED | **MoSCoW**: Should | **Branch**: — | **Reason**: No Cloudflare account
> **Resume via**: `/plan-modifier` → Resume Slice 4

## Context

- **Stage objective**: Deploy the dashboard to Cloudflare Pages with security headers and CI/CD pipeline.
- **Depends on**: Slice 1 (toolchain)
- **Global invariants**: → `docs/plan/invariants.md`
- **Note**: Docker static deploy was added in Slice Infra as an alternative — does NOT replace this slice (different deployment target).

## Resume Conditions

1. Cloudflare account created and configured
2. `CF_API_TOKEN` available for CI/CD pipeline
3. Project name registered in CF Pages

## Planned Scope (when resumed)

- `wrangler.toml` — CF Pages configuration
- `public/_headers` — Security headers (CSP, HSTS, CORS)
- `.dev.vars.example` — Secrets template
- `.github/workflows/deploy.yml` — Deployment workflow with `CF_API_TOKEN`

## Non-goals

- Docker deployment (already in Infra slice)
- Backend services (violates ADR-001)
