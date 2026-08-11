#!/usr/bin/env bash
# Logs into Amazon ECR and pushes every tag of the WebApp Docker image.
#
# Usage: push-webapp-docker-image.sh <image-name>
#
# Requires AWS_ACCOUNT_ID, AWS_REGION, and GITHUB_SHA in the environment.

set -euo pipefail

IMAGE_NAME="${1:?Usage: push-webapp-docker-image.sh <image-name>}"
: "${AWS_ACCOUNT_ID:?AWS_ACCOUNT_ID is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

IMAGE_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bfs_containers"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Pushing Docker images for $IMAGE_NAME"
docker push "$IMAGE_REPO:$IMAGE_NAME-$GITHUB_SHA"
docker push "$IMAGE_REPO:$IMAGE_NAME"
docker push "$IMAGE_REPO:$IMAGE_NAME-latest"
