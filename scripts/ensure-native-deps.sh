#!/bin/bash
# Ensure Rollup's platform binary is installed after npm ci (npm/cli#4828).
# Vitest stubs sharp — see src/tests/sharp-stub.ts.
set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

echo "Ensuring Rollup native binary for $(node -p "process.platform + '-' + process.arch")..."
npm rebuild rollup
