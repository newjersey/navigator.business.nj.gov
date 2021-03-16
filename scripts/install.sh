#!/usr/bin/env bash

npm --prefix=api install
npm --prefix=web install
npm install -g @aws-amplify/cli
npm install -g serverless
npm --prefix=api run install-dynamo-local