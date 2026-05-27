#!/bin/bash
# lint-staged wrapper — actionlint on staged workflow file(s).
set -e
set -o pipefail

if ! command -v actionlint >/dev/null 2>&1; then
  echo "⚠️  actionlint not in PATH — skipped (CI and lint:meta still enforce)"
  exit 0
fi

# actionlint expects repo context; validate each staged workflow path.
for workflow in "$@"; do
  actionlint "${workflow}"
done
