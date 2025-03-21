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
DEBUG="false"

COUNTER=0
MAX_ITEMS=1000
LAST_EVALUATED_KEY=""

JQ="jq"

# Check if jaq or gojq is available, otherwise fall back to jq
if command -v jaq &> /dev/null; then
    JQ="jaq"
    if [ "$DEBUG" = "true" ]; then
        echo "Using jaq for parsing."
    fi
elif command -v gojq &> /dev/null; then
    JQ="gojq"
    if [ "$DEBUG" = "true" ]; then
        echo "Using gojq for parsing."
    fi
elif command -v jq &> /dev/null; then
    JQ="jq"
    echo "Consider installing jaq or gojq for faster parsing."
else
    echo "You must have one of: jaq, gojq, or jq installed."
    exit 1
fi

DIRECTORY=$(mktemp -d)

echo "$DIRECTORY"

LAST_EVALUATED_KEY=""

while true; do
    if [ -z "$LAST_EVALUATED_KEY" ]; then
        RESULT=$(aws dynamodb scan --table-name "$TABLE_NAME" --region "$REGION" --output json --max-items "$MAX_ITEMS")
    else
        RESULT=$(aws dynamodb scan --table-name "$TABLE_NAME" --region "$REGION" --output json --max-items "$MAX_ITEMS" --starting-token "$LAST_EVALUATED_KEY")
    fi
    # echo "$RESULT" | grep "NAME"

    TEMP_FILE=$(mktemp -p "$DIRECTORY")
    echo "$RESULT" >> "$TEMP_FILE"

    LAST_EVALUATED_KEY=$(echo "$RESULT" | $JQ -r '.NextToken | tostring')
    echo "Last Evaluated Key: $LAST_EVALUATED_KEY"

    COUNTER=$((COUNTER + MAX_ITEMS))
    echo "Retrieved $COUNTER items..."

    if [ "$LAST_EVALUATED_KEY" == "null" ]; then
        break
    fi

    # adding a pause to prevent overloading DynamoDB requests
    echo "Pausing for 7 seconds..."
    sleep 7
    echo "Resuming..."
done

echo "Output saved to $OUTPUT_FILE"
