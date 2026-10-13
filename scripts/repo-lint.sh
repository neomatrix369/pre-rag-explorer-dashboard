#!/bin/bash
# Repo lint: shellcheck, actionlint, markdownlint.
# Mirrors the CI repo-lint job; safe to run locally at any time.
set -e
set -o pipefail

if command -v pre-commit >/dev/null 2>&1; then
  echo "--- shellcheck ---"
  pre-commit run shellcheck --all-files

  echo "--- actionlint ---"
  pre-commit run actionlint --all-files

  echo "--- markdownlint ---"
  pre-commit run markdownlint-cli2 --all-files
else
  echo "--- markdownlint (npm fallback) ---"
  npm run lint:md
  echo "⚠️  shellcheck and actionlint skipped — install pre-commit: pip install pre-commit"
fi
