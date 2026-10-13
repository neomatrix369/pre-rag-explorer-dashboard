#!/bin/bash
# Security scan — SCA, secrets, SAST, and dependency checks.
# Usage:
#   ./scripts/security-scan.sh          # fast checks (npm audit + gitleaks)
#   ./scripts/security-scan.sh --full   # + osv-scanner + semgrep + trivy + trufflehog
set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

FULL=false
if [[ "${1:-}" == "--full" ]]; then
  FULL=true
fi

echo "=== Security Scan ==="

# ── 1. npm audit (SCA — always) ─────────────────────────────────
echo "1. npm audit (high+ severity)..."
npm audit --audit-level=high

# ── 2. gitleaks (secrets — always) ──────────────────────────────
echo "2. gitleaks (secrets in working tree)..."
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --config .gitleaks.toml --source . --verbose --no-git
else
  echo "⚠️  gitleaks not installed — brew install gitleaks"
fi

if [[ "${FULL}" == "false" ]]; then
  echo ""
  echo "✅ Fast security scan passed. Run --full for deep scans."
  exit 0
fi

# ── 3. osv-scanner (OSS vulnerability DB) ───────────────────────
echo "3. osv-scanner..."
if command -v osv-scanner >/dev/null 2>&1; then
  osv-scanner --lockfile package-lock.json
else
  echo "⚠️  osv-scanner not installed — brew install osv-scanner"
fi

# ── 4. semgrep (SAST) ────────────────────────────────────────────
echo "4. semgrep (SAST — typescript rules)..."
if command -v semgrep >/dev/null 2>&1; then
  semgrep scan --config auto --lang ts src/ --error
else
  echo "⚠️  semgrep not installed — brew install semgrep"
fi

# ── 5. trivy (filesystem + SBOM) ────────────────────────────────
echo "5. trivy (filesystem scan)..."
if command -v trivy >/dev/null 2>&1; then
  trivy fs . --exit-code 1 --severity HIGH,CRITICAL --skip-dirs node_modules
else
  echo "⚠️  trivy not installed — brew install trivy"
fi

# ── 6. trufflehog (verified secrets in git history) ─────────────
echo "6. trufflehog (git history)..."
if command -v trufflehog >/dev/null 2>&1; then
  trufflehog git "file://$(pwd)" --only-verified --fail
else
  echo "⚠️  trufflehog not installed — brew install trufflehog"
fi

echo ""
echo "✅ Full security scan complete."
