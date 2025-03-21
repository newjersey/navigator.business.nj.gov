#!/usr/bin/env bash

# Documentation for setting up and running this can be found at
# https://engineering.docs.business.nj.gov/developer-operations/assuming-prod-user-dev/

set -eo pipefail

source ./api/.env

if [[ -z $AWS_PROFILE_PROD ]] || [[ -z $AWS_PROFILE_DEV ]] || [[ -z $DYNAMODB_TABLE_DEV ]] || [[ -z $DYNAMODB_TABLE_PROD ]]; then
    echo "The following environment variables must be set:
    - AWS_PROFILE_DEV
    - AWS_PROFILE_PROD
    - DYNAMODB_TABLE_DEV
    - DYNAMODB_TABLE_PROD"
    echo "Please check ./api/.env and set them before proceeding."
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

if ! command -v jq > /dev/null 2>&1; then
    echo "You must have jq installed."
    exit 1
fi

TEMP_PROD_DATA=$(mktemp)
# This cleans up the prod data after script execution, but it saves
# the dev backup, because we'll need it for the revert-user script.
trap 'rm -f "$TEMP_PROD_DATA"' EXIT

BACKUP_DIR="$HOME/.dynamodb-backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEV_DATA_BACKUP_FILE="$BACKUP_DIR/${DEV_UUID}_${TIMESTAMP}.json"

echo "Querying production user..."
if ! aws sts get-caller-identity --profile $AWS_PROFILE_PROD &>/dev/null; then
    echo "Access Token expired, logging you in first..."
    aws sso login --profile $AWS_PROFILE_PROD
fi
aws dynamodb query \
  --profile $AWS_PROFILE_PROD \
  --table-name "$DYNAMODB_TABLE_PROD" \
  --region "us-east-1" \
  --key-condition-expression "userId = :uuid" \
  --expression-attribute-values "{\":uuid\":{\"S\":\"$PROD_UUID\"}}" > "$TEMP_PROD_DATA"

if [ "$(jq '.Items | length' "$TEMP_PROD_DATA")" -eq 0 ]; then
  echo "No user found in production with UUID: $PROD_UUID"
  exit 1
fi

echo "Backing up dev user data..."
aws dynamodb query \
  --profile $AWS_PROFILE_DEV \
  --table-name "$DYNAMODB_TABLE_DEV" \
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

# `aws dynamodb put-item` replaces the entire object,
# whereas update-item only updates specific properties.
# In this case, we only want to update the `data`
# property, so using `aws dynamodb update-item`.
aws dynamodb update-item \
  --profile $AWS_PROFILE_DEV \
  --table-name "$DYNAMODB_TABLE_DEV" \
  --region "us-east-1" \
  --key '{"userId": {"S": "'$DEV_UUID'"}}' \
  --update-expression "SET #data = :data" \
  --expression-attribute-names '{"#data": "data"}' \
  --expression-attribute-values "$(jq -c '{":data": .Items[0].data}' "$TEMP_PROD_DATA")"

echo "Successfully updated dev user with production data."
echo "Backup of original dev data saved to: $DEV_DATA_BACKUP_FILE"
