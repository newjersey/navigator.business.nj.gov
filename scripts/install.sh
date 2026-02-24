#!/usr/bin/env bash
# Save current shell options so they can be restored at the end.
# When this script is sourced, set -euo pipefail would otherwise persist
# into the caller's interactive shell session.
_install_saved_opts=$(set +o 2>/dev/null)
set -euo pipefail

# Setup script to setup machine for local development

# Detect download tool (prefer curl, fall back to wget)
if command -v curl &> /dev/null; then
    fetch_url() { curl -fsSL "$1"; }
elif command -v wget &> /dev/null; then
    fetch_url() { wget -qO- "$1"; }
else
    echo "Error: Neither curl nor wget is available. Please install one to continue."
    exit 1
fi

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
elif [ -f /etc/alpine-release ]; then
    PLATFORM="alpine"
elif [ -f /etc/os-release ]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    case "${ID:-}" in
        ubuntu|debian) PLATFORM="debian" ;;
        fedora|rhel|centos) PLATFORM="fedora" ;;
        *) PLATFORM="unknown" ;;
    esac
else
    PLATFORM="unknown"
fi

echo "Detected platform: $PLATFORM"

# ============================================================
echo ""
echo "=== [1/7] Package manager ==="
# ============================================================

case "$PLATFORM" in
    macos)
        if command -v brew &> /dev/null; then
            echo "Homebrew is installed."
            brew --version
        else
            echo "Homebrew is not installed. Installing..."
            # https://brew.sh/
            /bin/bash -c "$(fetch_url https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        ;;
    debian)
        echo "Updating apt package index..."
        sudo apt-get update -y
        ;;
    alpine)
        echo "Updating apk package index..."
        sudo apk update
        ;;
    fedora)
        echo "Package manager: dnf."
        ;;
    *)
        echo "Warning: Unsupported platform '$PLATFORM'. Skipping package manager setup."
        ;;
esac

# ============================================================
echo ""
echo "=== [2/7] Docker runtime ==="
# ============================================================

case "$PLATFORM" in
    macos)
        if command -v colima &> /dev/null; then
            echo "Colima is installed."
            colima --version
        else
            echo "Colima is not installed. Installing..."
            # https://formulae.brew.sh/formula/colima#default
            # https://github.com/abiosoft/colima
            brew install colima
        fi

        # Adds Colima to a list of services to start on computer startup
        if brew services list | grep -q "^colima.*started"; then
            echo "Colima brew service is already started."
        else
            brew services start colima
        fi

        # Starts Colima with the recommended configuration
        if colima status &> /dev/null; then
            echo "Colima is already running."
        else
            colima start --cpu 8 --memory 16 --disk 256
        fi

        # Recommended configuration
        # cpu: 8
        # memory: 16
        # disk: 256

        # Required
        # arch: aarch64
        # runtime: docker

        if command -v docker &> /dev/null; then
            echo "Docker CLI is installed."
            docker --version
        else
            echo "Docker CLI is not installed. Installing..."
            # https://formulae.brew.sh/formula/docker
            brew install docker
        fi
        ;;
    debian|fedora)
        if command -v docker &> /dev/null; then
            echo "Docker is installed."
            docker --version
        else
            echo "Docker is not installed. Installing..."
            # https://get.docker.com handles apt, dnf, yum, etc.
            fetch_url https://get.docker.com | sudo sh
        fi

        if sudo systemctl is-active --quiet docker; then
            echo "Docker is already running."
        else
            sudo systemctl enable --now docker
        fi
        ;;
    alpine)
        if command -v docker &> /dev/null; then
            echo "Docker is installed."
            docker --version
        else
            echo "Docker is not installed. Installing..."
            sudo apk add docker
        fi

        if sudo rc-service docker status &> /dev/null; then
            echo "Docker is already running."
        else
            sudo rc-service docker start
            sudo rc-update add docker boot
        fi
        ;;
    *)
        echo "Warning: Unsupported platform '$PLATFORM'. Skipping Docker setup."
        ;;
esac

# ============================================================
echo ""
echo "=== [3/7] Python environment ==="
# ============================================================

# Detect python executable and verify minimum version
if command -v python3 &> /dev/null; then
    PYTHON="python3"
elif command -v python &> /dev/null; then
    PYTHON="python"
else
    echo "Error: No Python installation found. Please install Python 3.12 or later."
    exit 1
fi

PYTHON_VERSION=$("$PYTHON" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
if [ "$PYTHON_MAJOR" -lt 3 ] || { [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 12 ]; }; then
    echo "Error: Python 3.12 or later is required (found $PYTHON_VERSION)."
    exit 1
fi
echo "Python $PYTHON_VERSION found ($PYTHON)."

if [ -d ".venv" ]; then
    echo "Python virtual environment (.venv) already exists."
    VENV_DIR=".venv"
elif [ -d "venv" ]; then
    echo "Python virtual environment (venv) already exists."
    VENV_DIR="venv"
else
    echo "Creating Python virtual environment..."
    "$PYTHON" -m venv .venv
    VENV_DIR=".venv"
fi
source "$VENV_DIR/bin/activate"

if command -v sha256sum &> /dev/null; then
    REQUIREMENTS_HASH=$(sha256sum requirements.txt | awk '{print $1}')
else
    REQUIREMENTS_HASH=$(shasum -a 256 requirements.txt | awk '{print $1}')
fi
REQUIREMENTS_HASH_FILE="$VENV_DIR/.requirements_hash"
if [ ! -f "$REQUIREMENTS_HASH_FILE" ] || [ "$(cat "$REQUIREMENTS_HASH_FILE")" != "$REQUIREMENTS_HASH" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    echo "$REQUIREMENTS_HASH" > "$REQUIREMENTS_HASH_FILE"
else
    echo "Python dependencies are up to date."
fi

# ============================================================
echo ""
echo "=== [4/7] Node.js (via NVM) ==="
# ============================================================

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "NVM is installed."
else
    echo "NVM is not installed. Installing..."
    # https://github.com/nvm-sh/nvm
    DETECTED_SHELL="$(basename "$SHELL")"
    if [[ "$DETECTED_SHELL" != "bash" && "$DETECTED_SHELL" != "zsh" ]]; then
        DETECTED_SHELL="bash"
    fi
    fetch_url https://raw.githubusercontent.com/nvm-sh/nvm/HEAD/install.sh | "$DETECTED_SHELL"
fi

# Source NVM so it is available in this shell session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install and use correct version of Node
nvm install

# ============================================================
echo ""
echo "=== [5/7] Package manager (Yarn) ==="
# ============================================================

corepack enable && echo "Corepack enabled." || { echo "Failed to enable corepack."; exit 1; }
corepack prepare yarn@latest --activate && echo "Yarn activated." || { echo "Failed to activate Yarn."; exit 1; }
corepack prepare pnpm@latest --activate && echo "pnpm activated." || { echo "Failed to activate pnpm."; exit 1; }

# ============================================================
echo ""
echo "=== [6/7] Git hooks (Husky) ==="
# ============================================================

yarn run prepare && echo "Git hooks installed." || { echo "Failed to install git hooks."; exit 1; }

# ============================================================
echo ""
echo "=== [7/7] Install dependencies and build ==="
# ============================================================

yarn install && yarn build && echo "Dependencies installed and project built." || { echo "Install or build failed."; exit 1; }

# Restore the shell options that were active before this script ran.
eval "$_install_saved_opts"
unset _install_saved_opts
