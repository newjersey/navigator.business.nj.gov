#!/usr/bin/env bash

if [ -z "$CYPRESS_TEST_USER_EMAIL" ]
then
      echo "----------------------"
      echo "CYPRESS_TEST_USER_EMAIL not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi

if [ -z "$CYPRESS_TEST_USER_PASSWORD" ]
then
      echo "----------------------"
      echo "CYPRESS_TEST_USER_PASSWORD not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi

if [ -z "$CYPRESS_AWS_COGNITO_IDENTITY_POOL_ID" ]
then
      echo "----------------------"
      echo "CYPRESS_AWS_COGNITO_IDENTITY_POOL_ID not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi

if [ -z "$CYPRESS_AWS_USER_POOLS_ID" ]
then
      echo "----------------------"
      echo "CYPRESS_AWS_USER_POOLS_ID not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi

if [ -z "$CYPRESS_AWS_USER_POOLS_WEB_CLIENT_ID" ]
then
      echo "----------------------"
      echo "CYPRESS_AWS_USER_POOLS_WEB_CLIENT_ID not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi

if [ -z "$AIRTABLE_API_KEY" ]
then
      echo "----------------------"
      echo "AIRTABLE_API_KEY not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi

if [ -z "$AIRTABLE_BASE_ID" ]
then
      echo "----------------------"
      echo "AIRTABLE_BASE_ID not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi
