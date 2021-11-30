#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

shopt -s expand_aliases
alias nc='npx nc'

WEB_PORT=3001
API_PORT=5001
LAMBDA_PORT=5051
DYNAMO_PORT=8001
WIREMOCK_PORT=9001
API_BASE_URL=http://localhost:${API_PORT}/local

npx kill-port ${WEB_PORT}
npx kill-port ${API_PORT}
npx kill-port ${DYNAMO_PORT}
npx kill-port ${LAMBDA_PORT}
npx kill-port ${WIREMOCK_PORT}

set -e

echo "🚀 build shared library"
yarn workspace @businessnjgovnavigator/shared build

echo "🚀 starting wiremock"
yarn workspace @businessnjgovnavigator/api start:wiremock:with-port --port ${WIREMOCK_PORT} &
while ! echo exit | nc localhost ${WIREMOCK_PORT}; do sleep 1; done

echo "🚀 starting api"
export API_PORT=${API_PORT}
export DYNAMO_PORT=${DYNAMO_PORT}
export LAMBDA_PORT=${LAMBDA_PORT}
export LICENSE_STATUS_BASE_URL=http://localhost:${WIREMOCK_PORT}
export BUSINESS_NAME_BASE_URL=http://localhost:${WIREMOCK_PORT}
export GOV_DELIVERY_BASE_URL=http://localhost:${WIREMOCK_PORT}
yarn workspace @businessnjgovnavigator/api start &
while ! echo exit | nc localhost ${API_PORT}; do sleep 1; done

# need to start api before building webapp so that it can query for municipalities
echo "📦 building webapp"
API_BASE_URL=${API_BASE_URL} yarn workspace @businessnjgovnavigator/web build

echo "🚀 starting webapp"
yarn workspace @businessnjgovnavigator/web start --port=${WEB_PORT} &
while ! echo exit | nc localhost ${WEB_PORT}; do sleep 1; done

echo "🌟 app started"

CYPRESS_API_BASE_URL=${API_BASE_URL} yarn workspace @businessnjgovnavigator/web cypress:run:feature --browser=chrome --config baseUrl=http://localhost:${WEB_PORT}

set +e

npx kill-port ${WEB_PORT}
npx kill-port ${API_PORT}
npx kill-port ${DYNAMO_PORT}
npx kill-port ${LAMBDA_PORT}
npx kill-port ${WIREMOCK_PORT}

echo "   __            _                                             _"
echo "  / _| ___  __ _| |_ _   _ _ __ ___  ___   _ __   __ _ ___ ___| |"
echo " | |_ / _ \/ _\` | __| | | | '__/ _ \/ __| | '_ \ / _\` / __/ __| |"
echo " |  _|  __/ (_| | |_| |_| | | |  __/\__ \ | |_) | (_| \__ \__ \_|"
echo " |_|  \___|\__,_|\__|\__,_|_|  \___||___/ | .__/ \__,_|___/___(_)"
echo "                                          |_|                    "
echo ""