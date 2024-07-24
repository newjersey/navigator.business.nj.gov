#!/usr/bin/env bash

# Script to find out how many users we have that have duplicate email addresses.

TABLE_NAME="users-table-prod"
INDEX_NAME="EmailIndex"
OUTPUT_FILE="email-index.txt"
OUTPUT_CSV="email-index.csv"
LIMIT=200

# Initial scan without ExclusiveStartKey
SCAN_RESULTS=$(aws dynamodb scan --table-name "$TABLE_NAME" --region us-east-1 --index-name "$INDEX_NAME" --projection-expression email --limit $LIMIT --output json)

# Write initial results to file
SCAN_RESULTS_PROCESSED=$(echo "$SCAN_RESULTS" | jaq '.Items')
echo "$SCAN_RESULTS_PROCESSED" > $OUTPUT_FILE

# Get the LastEvaluatedKey
LAST_EVALUATED_KEY=$(echo "$SCAN_RESULTS" | jq -r '.LastEvaluatedKey')

# Loop until no more pages
while [ "$LAST_EVALUATED_KEY" != "null" ]; do
  SCAN_RESULTS=$(aws dynamodb scan --table-name "$TABLE_NAME" --region us-east-1 --index-name "$INDEX_NAME" --projection-expression email --limit $LIMIT --output json --exclusive-start-key "$LAST_EVALUATED_KEY")
  NEW_SCAN_RESULTS_PROCESSED=$(echo "$SCAN_RESULTS" | jq '.Items')
  SCAN_RESULTS_PROCESSED=$(jaq -s '.[0] + .[1]' <(echo "$SCAN_RESULTS_PROCESSED") <(echo "$NEW_SCAN_RESULTS_PROCESSED"))
  echo "$SCAN_RESULTS_PROCESSED" > $OUTPUT_FILE
  LAST_EVALUATED_KEY=$(echo "$SCAN_RESULTS" | jq -r '.LastEvaluatedKey')
done

EMAILS_SORTED=$(sort $OUTPUT_FILE | uniq -c | sort -r | awk '{print $2 "," $1}')
echo "$EMAILS_SORTED" > $OUTPUT_CSV
