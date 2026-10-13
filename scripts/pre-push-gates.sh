#!/bin/bash
# Pre-push gates — called by the pre-push git hook.
# Runs the FULL quality-gates suite (tests + coverage + audit + build).
# Do NOT add --quick here: every push must pass all gates.
set -e
set -o pipefail

echo "Running pre-push quality gates (full suite)..."
bash "$(dirname "$0")/quality-gates.sh"
