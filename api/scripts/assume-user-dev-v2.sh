#!/usr/bin/env bash

set -euo pipefail

# TODO make these environment variables whose values the user sets.
PROD_PROFILE="nav-prod"
DEV_PROFILE="nav-dev"

if [[ -z $PROD_PROFILE ]] || [[ -z $DEV_PROFILE ]]; then
    echo "PROD_PROFILE and DEV_PROFILE environment variables must be set."
    exit 1
fi

while [[ $# -gt 0 ]]; do
  case $1 in
    --prod-uuid)
      PROD_UUID="$2"
      shift 2
      ;;
    --dev-uuid)
      DEV_UUID="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [ -z "${PROD_UUID:-}" ] || [ -z "${DEV_UUID:-}" ] ; then
  echo "The following arguments are required:
    --prod-uuid
    --dev-uuid"
  exit 1
fi

TEMP_PROD_DATA=$(mktemp)
# Clean up prod data after script execution.
# Save the dev back because we'll need it for the revert script.
trap 'rm -f "$TEMP_PROD_DATA"' EXIT

BACKUP_DIR="$HOME/.dynamodb-backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEV_DATA_BACKUP_FILE="$BACKUP_DIR/${DEV_UUID}_${TIMESTAMP}.json"

echo "Querying production user..."
aws dynamodb query \
  --profile $PROD_PROFILE \
  --table-name "users-table-prod" \
  --region "us-east-1" \
  --key-condition-expression "userId = :uuid" \
  --expression-attribute-values "{\":uuid\":{\"S\":\"$PROD_UUID\"}}" > "$TEMP_PROD_DATA"

if [ "$(jq '.Items | length' "$TEMP_PROD_DATA")" -eq 0 ]; then
  echo "No user found in production with UUID: $PROD_UUID"
  exit 1
fi

echo "Backing up dev user data..."
aws dynamodb query \
  --profile $DEV_PROFILE \
  --table-name "users-table-dev" \
  --region "us-east-1" \
  --key-condition-expression "userId = :uuid" \
  --expression-attribute-values "{\":uuid\":{\"S\":\"$DEV_UUID\"}}" > "$DEV_DATA_BACKUP_FILE"

if [ "$(jq '.Items | length' "$DEV_DATA_BACKUP_FILE")" -eq 0 ]; then
  echo "No user found in dev with UUID: $DEV_UUID"
  exit 1
fi

echo "Updating dev user..."
PROD_ITEM=$(jq -c '.Items[0]' "$TEMP_PROD_DATA")
PROD_ITEM_WITH_DEV_UUID=$(echo "$PROD_ITEM" | jq --arg uuid "$DEV_UUID" '.userId.S = $uuid')

# TODO Remove these files
echo $PROD_ITEM >> prod-item.json
echo $PROD_ITEM_WITH_DEV_UUID >> prod-item-with-dev-uuid.json

# AWS_PROFILE=$DEV_PROFILE aws dynamodb put-item \
#   --table-name "my-dev-table" \
#   --region "us-east-1" \
#   --item "$PROD_ITEM_WITH_DEV_UUID"

# `aws dynamodb put-item` replaces the WHOLE object,
# whereas update-item can update specific properties.
# In this case, just update `data`

AWS_PROFILE=$DEV_PROFILE aws dynamodb update-item \
  --table-name "users-table-dev" \
  --key '{"userId": {"S": "'$DEV_UUID'"}}' \
  --update-expression "SET #data = :data" \
  --expression-attribute-names '{"#data": "data"}' \
  --expression-attribute-values "$(jq -c '{":data": .Items[0].data}' "$TEMP_PROD_DATA")"

# echo "Successfully updated dev user with production data"
echo "Backup of original dev data saved to: $DEV_DATA_BACKUP_FILE"
