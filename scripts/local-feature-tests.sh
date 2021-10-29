#!/usr/bin/env bash

WEB_PORT=3000
API_PORT=5000
API_BASE_URL=http://localhost:${API_PORT}/local

CYPRESS_API_BASE_URL=${API_BASE_URL} yarn workspace @businessnjgovnavigator/web cypress:open --config baseUrl=http://localhost:${WEB_PORT}
