#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)/api"

set -e

wget -c http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz
rm -rf .dynamodb
mkdir .dynamodb
tar zxvf dynamodb_local_latest.tar.gz -C .dynamodb
rm -rf dynamodb_local_latest.tar.gz