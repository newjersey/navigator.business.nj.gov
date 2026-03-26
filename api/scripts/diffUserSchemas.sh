#!/usr/bin/env bash
# Compares the TypeScript interface output from the TS Compiler API (--ts) against
# the Zod-derived TypeScript interface (--ts-zod). Exits 0 if identical, 1 if different.
#
# Usage:
#   yarn workspace @businessnjgovnavigator/api print:user-schema:diff

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ts_output=$(tsx "$SCRIPT_DIR/printUserZodSchema.ts" --ts 2>&1)
ts_zod_output=$(tsx "$SCRIPT_DIR/printUserZodSchema.ts" --ts-zod 2>&1)

if diff_result=$(diff --unified \
  --label "ts (from TS Compiler API)" \
  --label "ts-zod (from Zod schema)" \
  <(echo "$ts_output") \
  <(echo "$ts_zod_output")); then
  echo "Schemas are identical."
  exit 0
else
  echo "$diff_result"
  echo ""
  echo "---"
  echo "Found differences between --ts and --ts-zod outputs."
  echo "The --ts output reflects the TypeScript interfaces in the migration file."
  echo "The --ts-zod output reflects the Zod schema in zodSchemas.ts."
  exit 1
fi
