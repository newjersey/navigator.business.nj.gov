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

aws_command="aws dynamodb scan"
output_file="get-user-location-output.csv" # This filename is included in .gitignore to prevent accidental commits
max_items=1000
last_evaluated_key=""
counter=0
DEBUG="false"

region="$AWS_REGION"
table_name="$DYNAMODB_TABLE"
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

while true; do

    if [[ -z $last_evaluated_key ]]; then
        echo "email,addressLine1,addressLine2,addressState,addressZipCode" > "$output_file"
        scan_results=$($aws_command \
            --table-name "$table_name" \
            --region "$region" \
            --output json \
            --max-items "$max_items")
    else
        scan_results=$($aws_command \
            --table-name "$table_name" \
            --region "$region" \
            --output json \
            --max-items "$max_items" \
            --starting-token "$last_evaluated_key")
    fi

    if [[ -z $scan_results ]]; then
        echo "No matching results found."
        exit 0
    fi

    csv_data=$(echo "$scan_results" | $JQ -r '.Items[] | {
        email: .email.S,
        addressLine1: .data.M.formationData.M.formationFormData.M.addressLine1.S,
        addressLine2: .data.M.formationData.M.formationFormData.M.addressLine2.S,
        addressState: .data.M.formationData.M.formationFormData.M.addressState.M.name.S,
        addressZipCode: .data.M.formationData.M.formationFormData.M.addressZipCode.S
    } | [.email, .addressLine1, .addressLine2, .addressState, .addressZipCode] | @csv')

    echo "$csv_data" >> "$output_file"

    last_evaluated_key=$(echo "$scan_results" | $JQ -r '.NextToken | tostring')
    counter=$((counter + max_items))
    echo "Retrieved $counter items..."

    if [[ "$last_evaluated_key" == "null" ]]; then
        break
    fi

    # adding a pause to prevent overloading DynamoDB requests
    if [[ $((counter % 10000)) -eq 0 ]]; then
        echo "Pausing for 5 seconds..."
        sleep 5
        echo "Resuming..."
    fi
done

echo "User data exported to $output_file."
