#!/bin/bash
# Run all quality gates — mirrors .github/workflows/ci.yml exactly.
# Usage:
#   ./scripts/quality-gates.sh          # full CI mirror (default)
#   ./scripts/quality-gates.sh --quick  # lint + format + typecheck + test only
#   ./scripts/quality-gates.sh --full   # CI mirror + gitleaks config + pre-commit all-files

set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

MODE="default"
if [[ "${1:-}" == "--quick" ]]; then
  MODE="quick"
elif [[ "${1:-}" == "--full" ]]; then
  MODE="full"
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

if [[ "${MODE}" == "quick" ]]; then
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

if [[ "${MODE}" == "full" ]]; then
  echo ""
  echo "8/8 Full: gitleaks (with .gitleaks.toml)..."
  if command -v gitleaks >/dev/null 2>&1; then
    gitleaks detect --config .gitleaks.toml --source . --verbose --no-git
  else
    echo "⚠️  gitleaks not installed — skip"
  fi

  echo ""
  echo "9/9 Full: pre-commit all files..."
  if command -v pre-commit >/dev/null 2>&1; then
    pre-commit run --all-files
  else
    echo "⚠️  pre-commit not installed — skip (pip install pre-commit)"
  fi
fi

echo ""
echo "✅ All quality gates passed!"
echo "Safe to commit and push."
