#!/usr/bin/env bash

if [ -z "$CYPRESS_TEST_USER_EMAIL" ]
then
      echo "----------------------"
      echo "Environment variables not set!!"
      echo "----------------------"
      echo ""
      exit 1
fi
