#!/bin/bash
# Health check for Docker-deployed Pre-RAG Explorer dashboard.

set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi
HOST_PORT="${HOST_PORT:-3000}"
BASE_URL="http://localhost:${HOST_PORT}"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running."
    exit 1
fi

echo "Docker daemon: OK"

if command -v docker-compose >/dev/null 2>&1; then
    docker-compose ps
elif docker compose version >/dev/null 2>&1; then
    docker compose ps
fi

echo ""
echo "Service health:"

if curl -sf --max-time 5 "${BASE_URL}/health" | grep -q 'ok'; then
    echo "  /health: OK"
else
    echo "  /health: FAILED"
    exit 1
fi

if curl -sf --max-time 10 -o /dev/null "${BASE_URL}/"; then
    echo "  / (index): OK"
else
    echo "  / (index): FAILED"
    exit 1
fi

echo ""
echo "Dashboard is healthy at ${BASE_URL}"
