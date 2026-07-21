#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_COMMAND=()

docker_is_ready() {
  docker info >/dev/null 2>&1
}

brew_manages_colima() {
  command -v brew >/dev/null 2>&1 &&
    brew services list 2>/dev/null |
      awk '$1 == "colima" && $2 == "started" { found = 1 } END { exit !found }'
}

colima_is_running() {
  command -v colima >/dev/null 2>&1 && colima status >/dev/null 2>&1
}

recover_colima() {
  if [[ "$(uname -s)" != "Darwin" ]] ||
    ! command -v colima >/dev/null 2>&1 ||
    ! command -v brew >/dev/null 2>&1; then
    echo "Error: Docker is unavailable and Colima cannot be recovered automatically." >&2
    return 1
  fi

  if brew_manages_colima; then
    echo "Docker is unavailable. Restarting the Homebrew-managed Colima service..."
    brew services restart colima
  elif colima_is_running; then
    echo "Colima is running outside Homebrew services. Transferring lifecycle management..."
    brew services stop colima >/dev/null 2>&1 || true
    colima stop || true
    brew services start colima
  else
    echo "Error: Docker is unavailable and Colima is not running." >&2
    return 1
  fi

  echo "Waiting for Docker to become ready..."
  for _ in $(seq 1 30); do
    if colima_is_running && docker_is_ready; then
      echo "Docker is ready."
      return 0
    fi
    sleep 2
  done

  echo "Error: Docker did not become ready within 60 seconds." >&2
  return 1
}

select_compose_command() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_COMMAND=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1 &&
    docker-compose version >/dev/null 2>&1; then
    COMPOSE_COMMAND=(docker-compose)
  else
    echo "Error: Docker Compose is unavailable." >&2
    return 1
  fi
}

remove_project_containers() {
  local project_name="$1"
  local compose_file="$2"
  local container_ids

  if ! container_ids="$("${COMPOSE_COMMAND[@]}" -f "$compose_file" ps -aq)"; then
    echo "Error: Unable to inspect $project_name containers." >&2
    return 1
  fi

  if [[ -z "${container_ids//[[:space:]]/}" ]]; then
    echo "No $project_name containers found."
    return 0
  fi

  echo "Stopping and removing $project_name containers..."
  "${COMPOSE_COMMAND[@]}" -f "$compose_file" down --remove-orphans
}

cd "$REPO_ROOT"

if command -v docker >/dev/null 2>&1; then
  if ! docker_is_ready; then
    recover_colima
  fi

  select_compose_command
  remove_project_containers "Navigator" "$REPO_ROOT/docker-compose.yml"
  remove_project_containers \
    "static-site" \
    "$REPO_ROOT/packages/static-site/docker-compose.yml"
else
  echo "Docker is not installed; skipping container cleanup."
fi

# Navigator or static-site web server
yarn exec kill-port 3000

# Feature-test web server
yarn exec kill-port 3001

# Feature-test API
yarn exec kill-port 5001

# Local Navigator API
yarn exec kill-port 5002

# Legacy serverless-offline Lambda runtime
yarn exec kill-port 5050

# Feature-test Lambda runtime
yarn exec kill-port 5051

# Storybook
yarn exec kill-port 6006

# Local DynamoDB
yarn exec kill-port 8000

# DynamoDB Admin or feature-test DynamoDB
yarn exec kill-port 8001

# Decap CMS proxy
yarn exec kill-port 8081

# Local WireMock
yarn exec kill-port 9000

# Feature-test WireMock
yarn exec kill-port 9001
