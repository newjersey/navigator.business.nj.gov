#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)"

set -e

# format yaml files before building consolidated cms yaml config
yarn decap:enforce-yaml-quotes

yarn build
yarn typecheck
yarn workspace @businessnjgovnavigator/web typecheck:cypress

# format files
yarn prettier
yarn spellcheck
yarn dependency-check

# run linting and fix any fixable errors
yarn lint:fix