#!/bin/bash
# Repository integrity check — fast default, full optional.
# Adapted from price-analysis + rag-params-finder scripts/check_integrity.py
#
# Usage:
#   ./scripts/check_integrity.sh           # unit tests + import smoke
#   ./scripts/check_integrity.sh --full    # + quality-gates.sh + pre-commit (if installed)
#   ./scripts/check_integrity.sh --history N   # run tests at last N commits

set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

_run() {
  echo ""
  echo "────────────────────────────────────────────────────────────────────────"
  echo "$ $*"
  echo "────────────────────────────────────────────────────────────────────────"
  "$@"
}

check_unit_tests() {
  _run npm run test
}

check_import_smoke() {
  _run npm run test -- services/__tests__/importSmoke.test.ts
}

check_quality_gates() {
  _run bash scripts/quality-gates.sh
}

check_precommit() {
  if command -v pre-commit >/dev/null 2>&1; then
    _run pre-commit run --all-files
  else
    echo "⚠️  pre-commit not installed — skip (pip install pre-commit)"
  fi
}

check_gitleaks() {
  if command -v gitleaks >/dev/null 2>&1; then
    _run gitleaks detect --config .gitleaks.toml --source . --verbose --no-git
  else
    echo "⚠️  gitleaks not installed — skip"
  fi
}

check_history() {
  local n="$1"
  local original
  original="$(git rev-parse HEAD)"
  local failures=()

  while IFS= read -r sha; do
    [[ -z "${sha}" ]] && continue
    echo ""
    echo "========================================================================"
    echo "Checking commit ${sha}"
    echo "========================================================================"
    git checkout "${sha}" --quiet
    if ! check_unit_tests; then
      failures+=("${sha}")
    fi
  done < <(git log --oneline "-${n}" --format=%H)

  git checkout "${original}" --quiet

  if ((${#failures[@]} > 0)); then
    echo ""
    echo "❌ Failed at commits: ${failures[*]}"
    exit 1
  fi
  echo ""
  echo "✅ All ${n} commits passed unit tests."
}

if [[ "${1:-}" == "--history" ]]; then
  check_history "${2:?usage: check_integrity.sh --history N}"
  exit 0
fi

FULL=false
if [[ "${1:-}" == "--full" ]]; then
  FULL=true
fi

echo "=== Integrity Check (pre-rag-explorer-dashboard) ==="

FAILED=()

check_unit_tests || FAILED+=("unit tests")
check_import_smoke || FAILED+=("import smoke")

if [[ "${FULL}" == true ]]; then
  check_quality_gates || FAILED+=("quality gates")
  check_gitleaks || FAILED+=("gitleaks")
  check_precommit || FAILED+=("pre-commit")
fi

if ((${#FAILED[@]} > 0)); then
  echo ""
  echo "❌ Integrity check failed: ${FAILED[*]}"
  exit 1
fi

echo ""
echo "✅ Integrity check passed."
