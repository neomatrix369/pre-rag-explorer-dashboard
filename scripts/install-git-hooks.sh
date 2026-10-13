#!/bin/bash
# Install git hooks for this Node/TypeScript project.
#
# This project uses Husky (core.hooksPath=.husky) as the hook dispatcher:
#   - .husky/pre-commit  → gitleaks + lint-staged + pre-commit meta-linters
#   - .husky/pre-push    → scripts/pre-push-gates.sh (full quality gates)
#
# Optionally installs pre-commit for shellcheck/actionlint/markdownlint hooks
# that .husky/pre-commit invokes.
set -e
set -o pipefail

echo "Installing git hooks (Husky + optional pre-commit meta-linters)..."

# Ensure Husky hooks are executable
chmod +x .husky/pre-commit .husky/pre-push 2>/dev/null || true

# Husky is already active via core.hooksPath=.husky (set by npm run prepare / husky install).
# Re-run only if .husky/_/husky.sh is missing.
if [[ ! -f ".husky/_/husky.sh" ]]; then
  echo "Re-installing Husky..."
  npm run prepare
fi

# Optional: install pre-commit for meta-linter hooks
if command -v pre-commit >/dev/null 2>&1; then
  echo "Installing pre-commit hooks (meta-linters only — Husky drives pre-push)..."
  # Note: pre-commit install fails with core.hooksPath set.
  # Meta-linters are invoked by .husky/pre-commit calling pre-commit run <hook> directly.
  pre-commit install-hooks 2>/dev/null || echo "⚠️  pre-commit install-hooks skipped (Husky owns core.hooksPath)"
else
  echo "⚠️  pre-commit not installed — meta-linters will use npm run lint:md fallback"
  echo "   Install: pip install pre-commit"
fi

echo ""
echo "✅ Git hooks ready."
echo "   pre-commit: .husky/pre-commit (gitleaks + lint-staged + meta-linters)"
echo "   pre-push:   .husky/pre-push   (full quality gates)"
echo ""
echo "   Verify: pre-commit run --all-files  (or: bash scripts/quality-gates.sh)"
