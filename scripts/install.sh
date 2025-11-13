#!/usr/bin/env bash

# Setup script to setup machine for local development

# Homebrew
if command -v brew &> /dev/null; then
    echo "Homebrew is installed."
    brew --version
else
    echo "Homebrew is not installed. Installing..."
    # https://brew.sh/
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Colima
if command -v colima &> /dev/null; then
    echo "Colima is installed."
    colima --version
else
    echo "Colima is not installed. Installing..."
    # https://formulae.brew.sh/formula/colima#default
    # https://github.com/abiosoft/colima
    brew install colima
fi

# Recommended configuration
# cpu: 8
# memory: 16
# disk: 256

# Required
# arch: aarch64
# runtime: docker

colima start --cpu 8 --memory 16 --disk 256

# NVM
if command -v nvm &> /dev/null; then
    echo "NVM is installed."
    nvm --version
else
    echo "NVM is not installed. Installing..."
    # https://github.com/nvm-sh/nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi

# Install and user correct version of Node
nvm install

# Yarn
corepack enable

# Husky - redquired for pre-commit
yarn run prepare

yarn install && yarn build
