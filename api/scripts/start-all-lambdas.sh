#!/bin/bash
set -e

echo "Installing dependencies..."
yarn install

echo "Starting Express Lambda..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/express/app.ts &

echo "Starting EncryptTaxId Lambda..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/encryptTaxId/app.ts &

echo "Starting KillSwitch Lambda with hot reload..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/updateKillSwitchParameter/app.ts &

echo "Starting HealthCheck Lambda..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/healthCheck/app.ts &

echo "Starting MigrateUsers Lambda..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/migrateUsersVersion/app.ts &

echo "Starting UpdateExternalStatus Lambda..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/updateExternalStatus/app.ts &

echo "Starting GitHubOAuth Lambda..."
yarn tsx watch -r dotenv/config -r tsconfig-paths/register src/functions/githubOauth2/app.ts &

echo "All Lambdas started. Waiting for processes to exit..."
wait
