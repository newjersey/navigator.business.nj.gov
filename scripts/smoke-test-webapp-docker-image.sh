#!/usr/bin/env bash
# Starts the just-built WebApp Docker image and verifies it becomes healthy
# and serves the app before it is pushed.
#
# Usage: smoke-test-webapp-docker-image.sh <image-name>
#
# Requires AWS_ACCOUNT_ID, AWS_REGION, and GITHUB_SHA in the environment.
# Honors USE_BASIC_AUTH/BASIC_AUTH_USERNAME/BASIC_AUTH_PASSWORD if set.

set -euo pipefail

IMAGE_NAME="${1:?Usage: smoke-test-webapp-docker-image.sh <image-name>}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

IMAGE_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bfs_containers"
IMAGE="$IMAGE_REPO:$IMAGE_NAME-$GITHUB_SHA"
CONTAINER_NAME="navigator-web-smoke-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-0}"

cleanup() {
  docker rm --force "$CONTAINER_NAME" > /dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach \
  --name "$CONTAINER_NAME" \
  --publish 127.0.0.1:3000:3000 \
  "$IMAGE"

HEALTH_STATUS=""
for _ in {1..36}; do
  HEALTH_STATUS="$(docker inspect --format '{{.State.Health.Status}}' "$CONTAINER_NAME")"
  if [[ "$HEALTH_STATUS" == "healthy" ]]; then
    break
  fi
  if [[ "$HEALTH_STATUS" == "unhealthy" ]]; then
    docker logs "$CONTAINER_NAME"
    exit 1
  fi
  sleep 5
done

if [[ "$HEALTH_STATUS" != "healthy" ]]; then
  docker logs "$CONTAINER_NAME"
  exit 1
fi

CURL_AUTH=()
if [[ "${USE_BASIC_AUTH:-false}" == "true" ]]; then
  CURL_AUTH=(--user "${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}")
fi

curl --fail --silent --show-error http://127.0.0.1:3000/healthz > /dev/null
curl --fail --location --silent --show-error "${CURL_AUTH[@]}" \
  http://127.0.0.1:3000/ > /dev/null
curl --fail --location --silent --show-error "${CURL_AUTH[@]}" \
  http://127.0.0.1:3000/tasks/business-plan > /dev/null
curl --fail --silent --show-error \
  http://127.0.0.1:3000/vendor/img/nj_state_seal.png > /dev/null
