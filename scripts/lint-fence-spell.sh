#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

set -e

yarn build

yarn typecheck

yarn workspace @businessnjgovnavigator/web typecheck:cypress

# format files
yarn prettier

yarn spellcheck

yarn workspace @businessnjgovnavigator/web fences
yarn workspace @businessnjgovnavigator/api fences

# run tests, feature tests, and push
yarn workspace @businessnjgovnavigator/shared lint
yarn workspace @businessnjgovnavigator/web lint
yarn workspace @businessnjgovnavigator/api lint