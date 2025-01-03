#!/bin/bash
source ./api/.env


if [[ -z $AWS_ACCESS_KEY_ID_DEV ]] || [[ -z $AWS_SECRET_ACCESS_KEY_DEV ]] || [[ -z $AWS_SESSION_TOKEN_DEV ]]; then
    echo "AWS DEV session variables not set. Must set CLI short term credentials before proceeding. (in the aws access portal, expand the dropdown and click on access keys to get the values)"
    exit 1
fi

if [[ -z $AWS_ACCESS_KEY_ID_PROD ]] || [[ -z $AWS_SECRET_ACCESS_KEY_PROD ]] || [[ -z $AWS_SESSION_TOKEN_PROD ]]; then
    echo "AWS PROD session variables not set. Must set CLI short term credentials before proceeding. (in the aws access portal, expand the dropdown and click on access keys to get the values)"
    exit 1
fi

if [[ -z $AWS_REGION ]]; then
    echo "AWS region not set. Set AWS_REGION before proceeding."
    exit 1
fi

if [[ -z $DYNAMODB_TABLE_DEV ]]; then
    echo "No DEV table name provided. Set DYNAMODB_TABLE_DEV before proceeding."
    exit 1
fi

if [[ -z $DYNAMODB_TABLE_PROD ]]; then
    echo "No PROD table name provided. Set DYNAMODB_TABLE_PROD before proceeding."
    exit 1
fi

echo "no errors"


# PROD_USER_DATA=$(aws dynamodb scan --table-name $TABLE_NAME --region $REGION --output json --max-items $MAX_ITEMS)

MAX_ITEMS=2
# TODO: Error validation for passed aruments needed
TARGET_UUID=$1

# RESULT=$(aws dynamodb scan \
#     --table-name "$DYNAMODB_TABLE_PROD" \
#     --region "$AWS_REGION" \
#     --max-items "$MAX_ITEMS" \
#     --filter-expression "userId = :uuid" \
#     --expression-attribute-values '{":uuid":{"S":"'$TARGET_UUID'"}}')

RESULT=$(aws dynamodb query \
    --table-name "$DYNAMODB_TABLE_PROD" \
    --region "$AWS_REGION" \
    --key-condition-expression "userId = :uuid" \
    --expression-attribute-values '{":uuid":{"S":"'$TARGET_UUID'"}}')


# echo "$RESULT" | $JQ
echo $RESULT | jq

