#!/usr/bin/env bash

set -e
npm --prefix=api test
npm --prefix=web test