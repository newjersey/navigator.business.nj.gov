#!/usr/bin/env bash

npx kill-port 8001

set -e
npm --prefix=api test
npm --prefix=web test