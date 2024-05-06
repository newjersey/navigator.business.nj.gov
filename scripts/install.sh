#!/usr/bin/env bash

corepack enable
yarn

# for husky:
yarn run prepare

yarn workspace @businessnjgovnavigator/api install-dynamo-local
