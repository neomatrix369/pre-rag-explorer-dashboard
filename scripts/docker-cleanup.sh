#!/bin/bash
# Docker cleanup utility — sourced by start-services.sh and stop-services.sh.

set -e
set -o pipefail

docker_cleanup() {
    local cleanup_type="${1:-standard}"

    if [[ "$cleanup_type" != "silent" ]]; then
        echo "Cleaning up Docker resources..."
    fi

    local cid
    while IFS= read -r cid; do
        [[ -z "$cid" ]] && continue
        docker rm "$cid" >/dev/null 2>&1 || true
    done < <(docker ps -aq --filter "status=exited" 2>/dev/null || true)

    local image_id
    while IFS= read -r image_id; do
        [[ -z "$image_id" ]] && continue
        docker rmi "$image_id" >/dev/null 2>&1 || true
    done < <(docker images --filter "dangling=true" -q 2>/dev/null || true)

    docker network prune -f >/dev/null 2>&1 || true

    if [[ "$cleanup_type" == "aggressive" ]]; then
        docker volume prune -f >/dev/null 2>&1 || true
        docker image prune -a -f >/dev/null 2>&1 || true
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if ! command -v docker >/dev/null 2>&1; then
        echo "Docker is not installed. Skipping cleanup."
        exit 0
    fi
    if ! docker info >/dev/null 2>&1; then
        echo "Docker daemon is not running. Skipping cleanup."
        exit 0
    fi
    docker_cleanup "standard"
    echo "Docker cleanup completed."
fi
