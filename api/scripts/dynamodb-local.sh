#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)/api"

set -e

# Reference: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html#DynamoDBLocal.DownloadingAndRunning.title
# sha256 for verification: https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz.sha256

wget -c https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz
rm -rf .dynamodb
mkdir .dynamodb
tar zxvf dynamodb_local_latest.tar.gz -C .dynamodb
rm -rf dynamodb_local_latest.tar.gz
