#!/usr/bin/env bash

echo "What is the name of the migration file you want to create (excluding version number)?"

read NEW_FILENAME

if ! [[ $NEW_FILENAME =~ ^[a-z]+(_[a-z]+)*$ ]]; then
    echo "Error: Filename must be in snake_case (lowercase letters separated by underscores)"
    exit 1
fi

## Get most recent version number
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT/api/src/db/migrations/"

MOST_RECENT_FILENAME=$(ls -1v $(pwd) | sort -V | tail -n 1)

MOST_RECENT_FILENAME_WITHOUT_FILETYPE=$(echo $MOST_RECENT_FILENAME | cut -d "." -f 1)

MOST_RECENT_FILE_VERSION=$(echo $MOST_RECENT_FILENAME | cut -d "_" -f 1)

MOST_RECENT_VERSION_NUMBER=$(echo $MOST_RECENT_FILE_VERSION | cut -d "v" -f 2)

NEW_VERSION_NUMBER=$(($MOST_RECENT_VERSION_NUMBER + 1))

NEW_FILENAME_COMPLETE="v${NEW_VERSION_NUMBER}_${NEW_FILENAME}.ts"

## Create new file
cp "$MOST_RECENT_FILENAME" "$NEW_FILENAME_COMPLETE"
echo "New migration created at: api/src/db/migrations/$NEW_FILENAME_COMPLETE"

# Replace version numbers
sed -i.bak "s/$MOST_RECENT_VERSION_NUMBER/$NEW_VERSION_NUMBER/g" "$NEW_FILENAME_COMPLETE"

sed -i.bak "s/$((MOST_RECENT_VERSION_NUMBER - 1))/$MOST_RECENT_VERSION_NUMBER/g" "$NEW_FILENAME_COMPLETE"

## Adjust import in new file
MOST_RECENT_FILENAME_NO_EXT=${MOST_RECENT_FILENAME%.ts}
sed -i.bak "s|@db/migrations/.*|@db/migrations/$MOST_RECENT_FILENAME_NO_EXT\"|g" "$NEW_FILENAME_COMPLETE"

## Update current version variable in UserData.ts
sed -i.bak "s/$MOST_RECENT_VERSION_NUMBER/$NEW_VERSION_NUMBER/g" "../../../../shared/src/userData.ts"

## Add migration function to migration.ts collection
MIGRATE_FUNCTION_LAST_LINE_NUMBER=$(grep -n "migrate_v$(($MOST_RECENT_VERSION_NUMBER - 1))_to_v$MOST_RECENT_VERSION_NUMBER," "migrations.ts" | cut -d ":" -f 1)
MIGRATE_FUNCTION_NEXT_LINE_NUMBER=$((${MIGRATE_FUNCTION_LAST_LINE_NUMBER} + 1))
sed -i.bak "${MIGRATE_FUNCTION_NEXT_LINE_NUMBER}i\\
  migrate_v${MOST_RECENT_VERSION_NUMBER}_to_v${NEW_VERSION_NUMBER},
" "migrations.ts"

## Add new migration function import
MIGRATE_FUNCTION_IMPORT_LAST_LINE_NUMBER=$(grep -n "import { migrate_v$(($MOST_RECENT_VERSION_NUMBER - 1))_to_v$MOST_RECENT_VERSION_NUMBER }" "migrations.ts" | cut -d ":" -f 1)
MIGRATE_FUNCTION_IMPORT_NEW_LINE_NUMBER=$((${MIGRATE_FUNCTION_IMPORT_LAST_LINE_NUMBER} + 1))
sed -i.bak "${MIGRATE_FUNCTION_IMPORT_NEW_LINE_NUMBER}i\\
import { migrate_v${MOST_RECENT_VERSION_NUMBER}_to_v${NEW_VERSION_NUMBER} } from \"@db/migrations/v${NEW_VERSION_NUMBER}_${NEW_FILENAME}\";
" "migrations.ts"

## Update generator function in migrations.ts
sed -i.bak "s|v${MOST_RECENT_VERSION_NUMBER}UserData as CURRENT_GENERATOR } from \"@db/migrations/${MOST_RECENT_FILENAME_WITHOUT_FILETYPE}\"|v${NEW_VERSION_NUMBER}UserData as CURRENT_GENERATOR } from \"@db/migrations/v${NEW_VERSION_NUMBER}_${NEW_FILENAME}\"|g" "migrations.ts"

echo "Cleaning up backup files..."
cd "$PROJECT_ROOT"
find . -not -path "*/node_modules/*" -name "*.bak" -delete

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
