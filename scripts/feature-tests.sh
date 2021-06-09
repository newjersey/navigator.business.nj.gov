#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

WEB_PORT=3001
API_PORT=5001
LAMBDA_PORT=5051
DYNAMO_PORT=8001
WIREMOCK_PORT=9001
DB_NAME=businesstest
API_BASE_URL=http://localhost:${API_PORT}/dev

kill $(lsof -i:${WEB_PORT} -t)
kill $(lsof -i:${API_PORT} -t)
kill $(lsof -i:${DYNAMO_PORT} -t)
kill $(lsof -i:${LAMBDA_PORT} -t)
kill $(lsof -i:${WIREMOCK_PORT} -t)

set -e

# setup test postgres & seed it
psql -c "drop database if exists ${DB_NAME};" -U postgres -h localhost -p 5432
psql -c "create database ${DB_NAME};" -U postgres -h localhost -p 5432
npm --prefix=api run db-migrate up -- -e test
./scripts/seed-business-names.sh $DB_NAME

echo "🚀 starting wiremock"
npm --prefix=api run start:wiremock:with-port -- --port ${WIREMOCK_PORT} &
while ! echo exit | nc localhost ${WIREMOCK_PORT}; do sleep 1; done

echo "🚀 starting api"
export API_PORT=${API_PORT}
export DYNAMO_PORT=${DYNAMO_PORT}
export LAMBDA_PORT=${LAMBDA_PORT}
export DB_NAME=${DB_NAME}
LICENSE_STATUS_BASE_URL=http://localhost:${WIREMOCK_PORT}  npm --prefix=api start &
while ! echo exit | nc localhost ${API_PORT}; do sleep 1; done

# need to start api before building webapp so that it can query for municipalities
echo "📦 building webapp"
API_BASE_URL=${API_BASE_URL} npm --prefix=web run build

echo "🚀 starting webapp"
npm --prefix=web start -- --port=${WEB_PORT} &
while ! echo exit | nc localhost ${WEB_PORT}; do sleep 1; done

echo "🌟 app started"

CYPRESS_API_BASE_URL=${API_BASE_URL} npm --prefix=web run cypress:run -- --config baseUrl=http://localhost:${WEB_PORT}

set +e

psql -c "drop database if exists ${DB_NAME};" -U postgres -h localhost -p 5432

kill $(lsof -i:${WEB_PORT} -t)
kill $(lsof -i:${API_PORT} -t)
kill $(lsof -i:${DYNAMO_PORT} -t)
kill $(lsof -i:${LAMBDA_PORT} -t)

echo "   __            _                                             _"
echo "  / _| ___  __ _| |_ _   _ _ __ ___  ___   _ __   __ _ ___ ___| |"
echo " | |_ / _ \/ _\` | __| | | | '__/ _ \/ __| | '_ \ / _\` / __/ __| |"
echo " |  _|  __/ (_| | |_| |_| | | |  __/\__ \ | |_) | (_| \__ \__ \_|"
echo " |_|  \___|\__,_|\__|\__,_|_|  \___||___/ | .__/ \__,_|___/___(_)"
echo "                                          |_|                    "
echo ""