#!/bin/bash
# Start Pre-RAG Explorer via Docker Compose (production static build).

set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT}"

echo "Starting Pre-RAG Explorer (Docker)"
echo "=================================="

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running. Start Docker Desktop and retry."
    exit 1
fi

if command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_COMMAND=(docker-compose)
elif docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_COMMAND=(docker compose)
else
    echo "Docker Compose is not available."
    exit 1
fi

if [[ ! -f .env ]]; then
    echo ".env not found — creating from .env.example"
    cp .env.example .env
fi

# Compose reads .env for substitution; export HOST_PORT for health-check and port checks.
set -a
# shellcheck disable=SC1091
source .env
set +a
HOST_PORT="${HOST_PORT:-3000}"
export HOST_PORT

# shellcheck source=scripts/docker-cleanup.sh
source ./scripts/docker-cleanup.sh
docker_cleanup "standard"

echo "Checking port ${HOST_PORT}..."
if lsof -ti:"${HOST_PORT}" >/dev/null 2>&1; then
    if docker ps --format '{{.Ports}}' 2>/dev/null | grep -q "${HOST_PORT}->"; then
        echo "Port ${HOST_PORT} in use by an existing project container — restarting stack."
        "${DOCKER_COMPOSE_COMMAND[@]}" down >/dev/null 2>&1 || true
    else
        echo "Port ${HOST_PORT} is in use (e.g. npm run dev). Stop it or set HOST_PORT in .env."
        lsof -ti:"${HOST_PORT}" | head -3 | xargs ps -p 2>/dev/null || true
        exit 1
    fi
fi

echo "Building and starting dashboard..."
"${DOCKER_COMPOSE_COMMAND[@]}" up --build -d

echo "Waiting for container health..."
sleep 5

if [[ -x ./scripts/health-check.sh ]]; then
    ./scripts/health-check.sh
else
    curl -sf "http://localhost:${HOST_PORT}/health" >/dev/null
fi

echo ""
echo "Open http://localhost:${HOST_PORT}"
echo "Stop: ./stop-services.sh"
