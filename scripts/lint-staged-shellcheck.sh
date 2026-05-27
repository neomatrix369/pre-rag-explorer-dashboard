#!/bin/bash
# lint-staged wrapper — shellcheck one or more staged .sh files.
set -e
set -o pipefail

if ! command -v shellcheck >/dev/null 2>&1; then
  echo "⚠️  shellcheck not in PATH — skipped (CI and lint:meta still enforce)"
  exit 0
fi

shellcheck --external-sources "$@"
