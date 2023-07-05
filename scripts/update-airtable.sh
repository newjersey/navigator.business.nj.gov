#!/bin/bash

# Takes in a CSV, iterates over the contents, updates records in Airtable accordingly.
# The script assumes the CSV has 2 columns "Email" and "Zip Code" in that order.

# Most of these parameters can be found by visiting Airtable. See the Airtable API docs for more info.
# Ex: https://airtable.com/appXXXXXXXXXX/tblXXXXXXXXXX/viwXXXXXXXXXX
#                          BASE_ID       TABLE_ID      VIEW_ID

if [[ -z $AIRTABLE_TOKEN ]]; then
    echo "Airtable API token not set. Set AIRTABLE_TOKEN before proceeding."
    exit 1
fi

if [[ -z $AIRTABLE_BASE_ID ]]; then
    echo "Airtable Base ID not set. Set AIRTABLE_BASE_ID before proceeding."
    exit 1
fi

if [[ -z $AIRTABLE_TABLE_ID ]]; then
    echo "Airtable Table ID not set. Set AIRTABLE_TABLE_ID before proceeding."
    exit 1
fi

if [[ -z $AIRTABLE_VIEW_ID ]]; then
    echo "Airtable View ID not set. Set AIRTABLE_VIEW_ID before proceeding."
    exit 1
fi

if [[ -z $AIRTABLE_COLUMN_ID ]]; then
    echo "Airtable Column ID not set. Set AIRTABLE_COLUMN_ID before proceeding."
    exit 1
fi

api_key="$AIRTABLE_TOKEN"
base_id="$AIRTABLE_BASE_ID"
table_id="$AIRTABLE_TABLE_ID"
view_id="$AIRTABLE_VIEW_ID"
column_id="$AIRTABLE_COLUMN_ID"

source_csv="$1"

if [[ -z $source_csv ]]; then
    echo "No CSV file provided. Please provide a CSV file as the first argument."
    exit 1
fi

file_length=$(($(wc -l < "$source_csv" | awk '{ print $1 }') - 1))
echo "Updating $file_length records..."
iterator=0
while IFS=, read -r email zip_code; do
    ((++iterator))
    echo -e "\nUpdating  $iterator of $file_length..."
    echo "Email: $email"
    echo "Zip Code: $zip_code"
    encoded_email=$(printf %s "$email" | jq -s -R -r @uri)
    encoded_zip_code=$(printf %s "$zip_code" | jq -s -R -r @uri)
    base_endpoint="https://api.airtable.com/v0/${base_id}/${table_id}"

    response=$(curl -s -H "Authorization: Bearer ${api_key}" "${base_endpoint}?fields%5B%5D=Email+Address&filterByFormula=%7BEmail+Address%7D%3D%22${encoded_email}%22&view=${view_id}")

    ids=($(echo "$response" | jq -r '.records[].id'))

    if [[ ${#ids[@]} -eq 0 ]]; then
        echo "No records found for email address: $email"
        continue
    fi

updated_records=()
for recordID in "${ids[@]}"; do
    record="{ \"id\": \""${recordID}"\", \"fields\": { \"Zip Code\": \""${zip_code}"\" }}"
    updated_records+=("$record")
done

    updated_records_string=$(IFS=, ; echo "${updated_records[*]}")
    payload='{
      "records": ['${updated_records_string}']
    }'

    curl -X PATCH ${base_endpoint} \
    -H "Authorization: Bearer ${api_key}" \
    -H "Content-Type: application/json" \
    --data "${payload}"
done < <(tail -n +2 "$source_csv")
