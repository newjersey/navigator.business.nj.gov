#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

set -e

yarn build

yarn typecheck

yarn workspace @businessnjgovnavigator/web typecheck:cypress

# format files
yarn prettier

yarn spellcheck

yarn workspace @businessnjgovnavigator/web dependency-check
yarn workspace @businessnjgovnavigator/api dependency-check

# run tests, feature tests, and push
yarn workspace @businessnjgovnavigator/shared lint
yarn workspace @businessnjgovnavigator/web lint
yarn workspace @businessnjgovnavigator/api lint