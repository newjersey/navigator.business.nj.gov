#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)"

set -e

pnpm build
pnpm typecheck
pnpm --filter @businessnjgovnavigator/web run typecheck:cypress

# format files
pnpm prettier
pnpm spellcheck
pnpm dependency-check

(
    cd packages/static-site
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build
)

# run linting and fix any fixable errors
pnpm lint:fix
