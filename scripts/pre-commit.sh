#!/usr/bin/env bash

cd "$(git rev-parse --show-toplevel)"

set -e

./scripts/lint-fence-spell.sh
pnpm test