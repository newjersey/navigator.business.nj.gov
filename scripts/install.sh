#!/usr/bin/env bash

corepack enable
yarn 
yarn husky install
yarn workspace @businessnjgovnavigator/api install-dynamo-local
