#!/usr/bin/env bash

kill $(lsof -i:8001 -t)

set -e
npm --prefix=api test
npm --prefix=web test