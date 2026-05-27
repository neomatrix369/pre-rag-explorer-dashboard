#!/bin/bash
# Script-backed slice progress dashboard (price-analysis print_migration_progress pattern).
# Update METRICS when slices complete — run: ./scripts/print_slice_progress.sh
#
# Terminal snapshot complements docs/_internal/PROGRESS.md (human narrative).

set -euo pipefail

# ── Metrics (source of truth for numbers; reconcile with PROGRESS.md periodically) ──
TEST_COUNT=81
COVERAGE_THRESHOLD=40
COVERAGE_ACTUAL=72
SLICE_LAST_MERGED="Infra (PR #20)"
SLICE_CURRENT="Slice 8 — Markdown-Aware Chunking"
SLICE_STATUS="PLANNED"
BRANCH="main"

bar() {
  local done=$1 total=$2 width=12
  local filled=$(( done * width / total ))
  (( filled > width )) && filled=$width
  printf '%*s' "${filled}" '' | tr ' ' '█'
  printf '%*s' "$(( width - filled ))" '' | tr ' ' '░'
}

echo ""
echo "Pre-RAG Explorer Dashboard — Slice Progress"
echo "═══════════════════════════════════════════"
echo "Branch:  ${BRANCH}"
echo "Current: ${SLICE_CURRENT} (${SLICE_STATUS})"
echo "Last merged slice: ${SLICE_LAST_MERGED}"
echo ""
echo "Quality metrics"
echo "  Tests:    ${TEST_COUNT} passing"
echo "  Coverage: ${COVERAGE_ACTUAL}% actual / ${COVERAGE_THRESHOLD}% threshold  [$(bar "${COVERAGE_ACTUAL}" 100)]"
echo ""
echo "Slice roadmap (feature slices 8–15 planned — see docs/_internal/PROGRESS.md)"
echo "  [$(bar 8 15)] 8 milestones merged (slices 1–7 + Infra) / 15 feature slices planned"
echo ""
echo "Quick verify: ./scripts/check_integrity.sh"
echo "Full gates:   ./scripts/quality-gates.sh"
echo ""
