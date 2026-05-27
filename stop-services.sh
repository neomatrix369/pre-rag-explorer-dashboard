#!/bin/bash
# Stop Pre-RAG Explorer Docker stack (compact — no interactive menu).

set -e
set -o pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT}"

echo "Stopping Pre-RAG Explorer (Docker)"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed."
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

"${DOCKER_COMPOSE_COMMAND[@]}" down

# shellcheck source=scripts/docker-cleanup.sh
source ./scripts/docker-cleanup.sh
docker_cleanup "silent"

echo "Stopped. Start again with ./start-services.sh"
echo "Remove all data/volumes: docker compose down -v"
