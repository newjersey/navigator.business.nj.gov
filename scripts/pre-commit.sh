#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

set -e

npm run typecheck

npm run --prefix=web typecheck:cypress

# format files
npm run prettier

npm --prefix=web run spellcheck

npm --prefix=web run fences
npm --prefix=api run fences

# run tests, feature tests, and push
npm --prefix=web run lint
npm --prefix=api run lint
./scripts/test.sh