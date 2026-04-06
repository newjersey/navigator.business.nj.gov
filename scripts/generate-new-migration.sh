#!/usr/bin/env bash
set -euo pipefail

# Portable in-place sed using mktemp — avoids BSD/GNU sed compatibility issues
sedi() {
  local script="$1" file tmp
  shift
  for file in "$@"; do
    tmp=$(mktemp)
    sed "$script" "$file" > "$tmp" && mv "$tmp" "$file"
  done
}

echo "What is the name of the migration file you want to create (excluding version number)?"
read -r NEW_FILENAME

# Normalize to snake_case: lowercase, replace non-alphanumeric runs with underscores, strip leading/trailing underscores
NEW_FILENAME=$(echo "$NEW_FILENAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_' | sed 's/^_*//;s/_*$//')

if [[ -z "$NEW_FILENAME" ]]; then
  echo "Error: Could not derive a valid filename from input"
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_ROOT/api/src/db/migrations"

cd "$MIGRATIONS_DIR" || exit

# Derive version info from the most recent migration file
MOST_RECENT_FILENAME=$(find . -maxdepth 1 -name "v*.ts" ! -name "*.test.ts" | sort -V | tail -n 1)
MOST_RECENT_FILENAME="${MOST_RECENT_FILENAME#./}"
MOST_RECENT_FILENAME_NO_EXT="${MOST_RECENT_FILENAME%.ts}"
MOST_RECENT_VERSION_NUMBER="${MOST_RECENT_FILENAME%%_*}"
MOST_RECENT_VERSION_NUMBER="${MOST_RECENT_VERSION_NUMBER#v}"

PREV_VERSION_NUMBER=$((MOST_RECENT_VERSION_NUMBER - 1))
NEW_VERSION_NUMBER=$((MOST_RECENT_VERSION_NUMBER + 1))
NEW_FILENAME_COMPLETE="v${NEW_VERSION_NUMBER}_${NEW_FILENAME}.ts"

# Create new migration file from the previous one
cp "$MOST_RECENT_FILENAME" "$NEW_FILENAME_COMPLETE"
echo "New migration created at: api/src/db/migrations/$NEW_FILENAME_COMPLETE"

# Update version numbers inside the new file
sedi "s/$MOST_RECENT_VERSION_NUMBER/$NEW_VERSION_NUMBER/g" "$NEW_FILENAME_COMPLETE"
sedi "s/$PREV_VERSION_NUMBER/$MOST_RECENT_VERSION_NUMBER/g" "$NEW_FILENAME_COMPLETE"

# Fix the import to point to the previous migration file
sedi "s|@db/migrations/.*|@db/migrations/$MOST_RECENT_FILENAME_NO_EXT\"|g" "$NEW_FILENAME_COMPLETE"

# Update CURRENT_VERSION in userData.ts
sedi "s/$MOST_RECENT_VERSION_NUMBER/$NEW_VERSION_NUMBER/g" "$PROJECT_ROOT/shared/src/userData.ts"

# Add new migration function to migrations.ts
PREV_MIGRATE_LINE=$(grep -n "migrate_v${PREV_VERSION_NUMBER}_to_v${MOST_RECENT_VERSION_NUMBER}," migrations.ts | cut -d ":" -f 1)
sedi "$((PREV_MIGRATE_LINE + 1))i\\
  migrate_v${MOST_RECENT_VERSION_NUMBER}_to_v${NEW_VERSION_NUMBER},
" migrations.ts

# Add new import to migrations.ts
PREV_IMPORT_LINE=$(grep -n "import { migrate_v${PREV_VERSION_NUMBER}_to_v${MOST_RECENT_VERSION_NUMBER} }" migrations.ts | cut -d ":" -f 1)
sedi "$((PREV_IMPORT_LINE + 1))i\\
import { migrate_v${MOST_RECENT_VERSION_NUMBER}_to_v${NEW_VERSION_NUMBER} } from \"@db/migrations/v${NEW_VERSION_NUMBER}_${NEW_FILENAME}\";
" migrations.ts

# Update CURRENT_GENERATOR export in migrations.ts
sedi "s|v${MOST_RECENT_VERSION_NUMBER}UserData as CURRENT_GENERATOR } from \"@db/migrations/${MOST_RECENT_FILENAME_NO_EXT}\"|v${NEW_VERSION_NUMBER}UserData as CURRENT_GENERATOR } from \"@db/migrations/v${NEW_VERSION_NUMBER}_${NEW_FILENAME}\"|g" migrations.ts

# Update Zod schema files and the schema generator script
ZOD_SCHEMA_FILE="$PROJECT_ROOT/api/src/db/zodSchema/zodSchemas.ts"
ZOD_SCHEMA_TEST_FILE="$PROJECT_ROOT/api/src/db/zodSchema/zodSchemas.test.ts"
PRINT_USER_SCHEMA_FILE="$PROJECT_ROOT/api/scripts/printUserZodSchema.ts"
GENERATE_USER_SCHEMA_FILE="$PROJECT_ROOT/api/scripts/generateUserSchemaFile.ts"
USER_SCHEMA_GENERATOR_FILE="$PROJECT_ROOT/api/src/domain/userSchemaGenerator.ts"

echo "Updating Zod schema imports and schema version numbers"
sedi "s/${MOST_RECENT_FILENAME_NO_EXT}/v${NEW_VERSION_NUMBER}_${NEW_FILENAME}/g" \
  "$ZOD_SCHEMA_FILE" \
  "$ZOD_SCHEMA_TEST_FILE" \
  "$PRINT_USER_SCHEMA_FILE" \
  "$GENERATE_USER_SCHEMA_FILE" \
  "$USER_SCHEMA_GENERATOR_FILE"

sedi "s/${MOST_RECENT_VERSION_NUMBER}/${NEW_VERSION_NUMBER}/g" \
  "$ZOD_SCHEMA_FILE" \
  "$ZOD_SCHEMA_TEST_FILE" \
  "$PRINT_USER_SCHEMA_FILE" \
  "$GENERATE_USER_SCHEMA_FILE" \
  "$USER_SCHEMA_GENERATOR_FILE"

echo "Regenerating cached user schema..."
yarn workspace @businessnjgovnavigator/api generate:user-schema

echo ""
echo "------------------------------------"
echo "Migration file created successfully!"
echo "------------------------------------"
echo ""
echo "Please do the following:"
echo "   - Make any needed changes to the migration function"
echo "   - Make sure the type definitions in $NEW_FILENAME_COMPLETE match those in userData.ts"
echo "   - Check imports in $NEW_FILENAME_COMPLETE to make sure everything has been exported from the previous migration file"
echo "   - Add any tests you feel are necessary"
echo ""
