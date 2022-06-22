#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)"

set -e

yarn build
yarn typecheck
yarn workspace @businessnjgovnavigator/web typecheck:cypress

# format files
yarn prettier
yarn spellcheck
yarn dependency-check

# run linting and fix any fixable errors
yarn lint:fix