#!/usr/bin/env bash

# Documentation for setting up and running this can be found at
# https://engineering.docs.business.nj.gov/developer-operations/assuming-prod-user-dev/

set -eo pipefail

source ./api/.env


if [[ -z $AWS_PROFILE_DEV ]]; then
    echo "AWS_PROFILE_DEV environment variable must be set."
    exit 1
fi

while [[ $# -gt 0 ]]; do
  case $1 in
    --dev-uuid)
      DEV_UUID="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      shift 2
      ;;
  esac
done

if [ -z "${DEV_UUID:-}" ]; then
  echo "--dev-uuid is required"
  exit 1
fi
BACKUP_DIR="$HOME/.dynamodb-backups"
LATEST_BACKUP=$(ls -t "$HOME/.dynamodb-backups"/${DEV_UUID}_*.json | head -n1)
if [ -z "$LATEST_BACKUP" ]; then
  echo "No backup found for UUID: $DEV_UUID"
  exit 1
fi

if ! command -v jq > /dev/null 2>&1; then
    echo "You must have jq installed."
    exit 1
fi

if [ "$(jq '.Items | length' "$LATEST_BACKUP")" -eq 0 ]; then
  echo "Backup file is empty or corrupted"
  exit 1
fi


echo "Restoring from backup: $LATEST_BACKUP"
BACKUP_ITEM=$(jq -c '.Items[0]' "$LATEST_BACKUP")

aws dynamodb put-item \
  --profile "$AWS_PROFILE_DEV" \
  --table-name "$DYNAMODB_TABLE_DEV" \
  --region "us-east-1" \
  --item "$BACKUP_ITEM"

echo "Successfully restored dev user from backup"
