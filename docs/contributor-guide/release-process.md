# Release Process

Adapted from rag-params-finder `docs/contributor-guide/release-process.md` for a single-package browser app.

---

## Versioning

[Semantic Versioning](https://semver.org/):

| Bump | When |
|------|------|
| **MINOR** (0.x.0) | Completed feature slice (chunking method, model, UI feature) |
| **PATCH** (0.0.x) | Bug fix, polish, docs-only bundled with a fix |
| **MAJOR** (x.0.0) | Breaking storage format or API (rare) |

**Do not release** for every commit, WIP features, or internal refactors without user-visible change.

---

## When to release

✅ Slice merged (e.g. Slice 7 → 0.7.0)
✅ Infra/toolchain milestone with contributor-visible impact
✅ Bug fix users would notice

❌ Single doc typo
❌ Mid-slice WIP

Mark slice ✔️ MERGED in `docs/_internal/PROGRESS.md` before tagging.

---

## Release checklist

1. **Verify** — `./scripts/quality-gates.sh`
2. **CHANGELOG** — move `[Unreleased]` items to `## [X.Y.Z] - YYYY-MM-DD`
3. **Version** — update `package.json` `"version"` to match CHANGELOG
4. **Tag** — `git tag -a vX.Y.Z -m 'Release vX.Y.Z — <one line>'`
5. **Push** — `git push origin main --tags`
6. **GitHub Release** — `gh release create vX.Y.Z --generate-notes`

---

## Version sync note

`CHANGELOG.md` tracks slice versions (0.1.0–0.7.0 merged; Infra milestone in `[Unreleased]`). `package.json` is still `0.0.0` until first tagged release — align both when cutting **v0.8.0** (Infra + doc hub) or the next feature slice release.

---

## Future automation (Could)

rag-params-finder ships `scripts/release.sh` + `bump_version.py` syncing Python + frontend versions. For this repo, a slim script updating `package.json` + CHANGELOG header is sufficient when release cadence increases.

---

## See also

- [CHANGELOG.md](../../CHANGELOG.md)
- [Development Guide](development.md) — post-slice checklist
