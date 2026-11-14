#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)"

set -e

pnpm run build
pnpm run typecheck
pnpm --filter @businessnjgovnavigator/web run typecheck:cypress

# format files
pnpm run format
pnpm run spellcheck
pnpm run dependency-check

(
    cd packages/static-site
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build
)

# run linting and fix any fixable errors
pnpm run lint:fix
