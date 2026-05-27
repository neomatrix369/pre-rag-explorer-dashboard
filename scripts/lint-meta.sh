#!/bin/bash
# Shell, workflow, and markdown linters — complements ESLint/Prettier (TS/JSON/YAML/HTML).
# CI: ubuntu-latest has shellcheck; workflow uses rhysd/actionlint for workflows.
# Local: pip install pre-commit && pre-commit install-hooks (recommended), or brew install shellcheck actionlint.
set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

SCOPE="${1:---all}"
HOOKS=(shellcheck actionlint markdownlint-cli2)
STRICT_BINARIES=false
if [[ "${CI:-}" == "true" ]] || [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  STRICT_BINARIES=true
fi

run_pre_commit() {
  if ! command -v pre-commit >/dev/null 2>&1; then
    return 1
  fi
  local extra_args=()
  if [[ "${SCOPE}" != "--staged" ]]; then
    extra_args=(--all-files)
  fi
  local hook
  for hook in "${HOOKS[@]}"; do
    pre-commit run "${hook}" "${extra_args[@]}"
  done
}

run_shellcheck() {
  local hint="brew install shellcheck, or: pip install pre-commit && pre-commit install-hooks"
  if command -v shellcheck >/dev/null 2>&1; then
    shellcheck --external-sources scripts/*.sh start-services.sh stop-services.sh
    return 0
  fi
  if [[ "${STRICT_BINARIES}" == "true" ]]; then
    echo "❌ shellcheck required in CI — ${hint}"
    return 1
  fi
  echo "⚠️  shellcheck not found — skipped locally (${hint})"
  return 0
}

run_actionlint() {
  local hint="brew install actionlint, or: pip install pre-commit && pre-commit install-hooks"
  if command -v actionlint >/dev/null 2>&1; then
    actionlint
    return 0
  fi
  if [[ "${STRICT_BINARIES}" == "true" ]]; then
    echo "❌ actionlint required in CI — ${hint}"
    return 1
  fi
  echo "⚠️  actionlint not found — skipped locally (${hint})"
  return 0
}

run_fallback() {
  local failed=0

  run_shellcheck || failed=1
  run_actionlint || failed=1

  npm run lint:md || failed=1
  return "${failed}"
}

if command -v pre-commit >/dev/null 2>&1 && run_pre_commit; then
  exit 0
fi

echo "pre-commit unavailable or hooks missing — using fallback linters"
if ! run_fallback; then
  echo ""
  echo "Install pinned linters: pip install pre-commit && pre-commit install-hooks"
  exit 1
fi
