#!/bin/bash
# Run all quality gates — mirrors .github/workflows/ci.yml exactly.
# Usage: ./scripts/quality-gates.sh [--quick]
#   --quick  lint + typecheck + test only (skip coverage, audit, build)

set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

QUICK=false
if [[ "${1:-}" == "--quick" ]]; then
  QUICK=true
fi

echo "=== Quality Gates ==="

echo "1/7 Lint..."
npm run lint

echo "2/7 Format check..."
npm run format:check

echo "3/7 Type check..."
npm run typecheck

echo "4/7 Unit tests..."
npm run test

if [[ "${QUICK}" == true ]]; then
  echo ""
  echo "✅ Quick quality gates passed (coverage, audit, build skipped)."
  exit 0
fi

echo "5/7 Coverage..."
npm run test:coverage

echo "6/7 Security audit..."
npm audit --audit-level=high

echo "7/7 Build..."
npm run build

echo ""
echo "✅ All quality gates passed!"
echo "Safe to commit and push."
