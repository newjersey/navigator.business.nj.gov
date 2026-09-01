#!/usr/bin/env bash
# Builds the WebApp Docker image, tagged for a given image name.
#
# Usage: build-webapp-docker-image.sh <image-name>
#
# Requires AWS_ACCOUNT_ID, AWS_REGION, and GITHUB_SHA in the environment.
# Generates a build-time secret file from the current environment via
# scripts/create-web-build-environment.ts and removes it once the build ends.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

IMAGE_NAME="${1:?Usage: build-webapp-docker-image.sh <image-name>}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

IMAGE_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bfs_containers"

WEB_BUILD_ENVIRONMENT_FILE="$(mktemp "${RUNNER_TEMP:-/tmp}/web-build-environment.XXXXXX")"
trap 'rm -f "$WEB_BUILD_ENVIRONMENT_FILE"' EXIT

yarn tsx scripts/create-web-build-environment.ts > "$WEB_BUILD_ENVIRONMENT_FILE"

echo "Building Docker image for $IMAGE_NAME"
docker build -f WebApp.Dockerfile . \
  --secret "id=web-build-environment,src=$WEB_BUILD_ENVIRONMENT_FILE" \
  -t "$IMAGE_REPO:$IMAGE_NAME-$GITHUB_SHA" \
  -t "$IMAGE_REPO:$IMAGE_NAME" \
  -t "$IMAGE_REPO:$IMAGE_NAME-latest"
