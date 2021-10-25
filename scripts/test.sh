#!/usr/bin/env bash

npx kill-port 8001

set -e
yarn workspace @businessnjgovnavigator/api test
yarn workspace @businessnjgovnavigator/web test
yarn workspace @businessnjgovnavigator/shared test