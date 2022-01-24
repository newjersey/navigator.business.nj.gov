#!/usr/bin/env bash

npm -g install yarn
yarn 
yarn husky install
yarn workspace @businessnjgovnavigator/api install-dynamo-local