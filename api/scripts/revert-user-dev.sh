#!/usr/bin/env bash

set -euo pipefail

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dev-uuid)
      DEV_UUID="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      # exit 1
      shift 2
      ;;
  esac
done
# Validate required arguments
if [ -z "${DEV_UUID:-}" ]; then
  echo "--dev-uuid is required"
  exit 1
fi

# Find the most recent backup for this UUID
BACKUP_DIR="$HOME/.dynamodb-backups"
echo 'HERE'
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/${DEV_UUID}_*.json 2>/dev/null | head -n1)
echo "STILL HERE"
if [ -z "$LATEST_BACKUP" ]; then
  echo "No backup found for UUID: $DEV_UUID"
  exit 1
fi

echo 'here'
# Verify backup file contains data
if [ "$(jq '.Items | length' "$LATEST_BACKUP")" -eq 0 ]; then
  echo "Backup file is empty or corrupted"
  exit 1
fi

# Restore the backup
echo "Restoring from backup: $LATEST_BACKUP"
BACKUP_ITEM=$(jq -c '.Items[0]' "$LATEST_BACKUP")

AWS_PROFILE=nav-dev aws dynamodb put-item \
  --table-name "users-table-dev" \
  --region "us-east-1" \
  --item "$BACKUP_ITEM"

echo "Successfully restored dev user from backup"
