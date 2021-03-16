#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

WEB_PORT=3000
API_PORT=5000
API_BASE_URL=http://localhost:${API_PORT}/dev

source ./scripts/env.sh
CYPRESS_API_BASE_URL=${API_BASE_URL} npm --prefix=web run cypress:open -- --config baseUrl=http://localhost:${WEB_PORT}
