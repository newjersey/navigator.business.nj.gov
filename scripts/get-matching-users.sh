#!/bin/bash

if [[ -z $AWS_ACCESS_KEY_ID ]] || [[ -z $AWS_SECRET_ACCESS_KEY ]] || [[ -z $AWS_SESSION_TOKEN ]]; then
    echo "AWS session variables not set. Must set CLI short term credentials before proceeding."
    exit 1
fi

if [[ -z $AWS_REGION ]]; then
    echo "AWS region not set. Set AWS_REGION before proceeding."
    exit 1
fi

if [[ -z $DYNAMODB_TABLE ]]; then
    echo "No table name provided. Set DYNAMODB_TABLE before proceeding."
    exit 1
fi

REGION="$AWS_REGION"
TABLE_NAME="$DYNAMODB_TABLE"
OUTPUT_FILE="results.csv" # This filename is included in .gitignore to prevent accidental commits

COUNTER=0
MAX_ITEMS=1000
LAST_EVALUATED_KEY=""

while true; do
    if [ -z "$LAST_EVALUATED_KEY" ]; then
        RESULT=$(aws dynamodb scan --table-name $TABLE_NAME --region $REGION --output json --max-items $MAX_ITEMS)
    else
        RESULT=$(aws dynamodb scan --table-name $TABLE_NAME --region $REGION --output json --max-items $MAX_ITEMS --starting-token $LAST_EVALUATED_KEY)
    fi

    echo "$RESULT" | \
    jq -r '.Items[] | select(.data.M.businesses and .data.M.businesses.M) | select(.data.M.businesses.M | to_entries[] | .value.M.profileData and .value.M.profileData.M.businessPersona.S == "FOREIGN" and .value.M.profileData.M.industryId.S == "cannabis") | [.userId.S, (to_entries | .[].key)] | @csv' >> $OUTPUT_FILE

    LAST_EVALUATED_KEY=$(echo "$RESULT" | jq -r '.NextToken | tostring')
    echo "Last Evaluated Key: $LAST_EVALUATED_KEY"

    COUNTER=$((COUNTER + MAX_ITEMS))
    echo "Retrieved $COUNTER items..."

    if [ "$LAST_EVALUATED_KEY" == "null" ]; then
        break
    fi

    # adding a pause to prevent overloading DynamoDB requests
    echo "Pausing for 5 seconds..."
    sleep 5
    echo "Resuming..."
done

echo "Output saved to $OUTPUT_FILE"
