#!/usr/bin/env zsh
# Save current shell options so they can be restored at the end.
# When this script is sourced, set -euo pipefail would otherwise persist
# into the caller's interactive shell session.
_install_saved_opts=$(set +o 2>/dev/null)
_install_saved_stty=$(stty -g 2>/dev/null) || _install_saved_stty=""
set -euo pipefail

# Setup script to setup machine for local development

# Detect privilege escalation method
if [ "$(id -u)" -eq 0 ]; then
    SUDO=""
    SKIP_PRIVILEGED=false
elif sudo -n true 2>/dev/null; then
    SUDO="sudo"
    SKIP_PRIVILEGED=false
else
    SUDO=""
    SKIP_PRIVILEGED=true
    echo "Warning: Not running as root and sudo is not available. Steps requiring elevated permissions will be skipped."
fi

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
        if [ "$SKIP_PRIVILEGED" = false ]; then
            echo "Updating apt package index..."
            $SUDO apt-get update -y
        else
            echo "Skipping apt update (no sudo access)."
        fi
        ;;
    alpine)
        if [ "$SKIP_PRIVILEGED" = false ]; then
            echo "Updating apk package index..."
            $SUDO apk update
        else
            echo "Skipping apk update (no sudo access)."
        fi
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
        elif [ "$SKIP_PRIVILEGED" = false ]; then
            echo "Docker is not installed. Installing..."
            # https://get.docker.com handles apt, dnf, yum, etc.
            fetch_url https://get.docker.com | $SUDO sh
        else
            echo "Docker is not installed. Skipping installation (requires elevated permissions)."
        fi

        if [ "$SKIP_PRIVILEGED" = false ]; then
            if $SUDO systemctl is-active --quiet docker; then
                echo "Docker is already running."
            else
                $SUDO systemctl enable --now docker
            fi
        else
            echo "Skipping Docker service management (requires elevated permissions)."
        fi
        ;;
    alpine)
        if command -v docker &> /dev/null; then
            echo "Docker is installed."
            docker --version
        elif [ "$SKIP_PRIVILEGED" = false ]; then
            echo "Docker is not installed. Installing..."
            $SUDO apk add docker
        else
            echo "Docker is not installed. Skipping installation (requires elevated permissions)."
        fi

        if [ "$SKIP_PRIVILEGED" = false ]; then
            if $SUDO rc-service docker status &> /dev/null; then
                echo "Docker is already running."
            else
                $SUDO rc-service docker start
                $SUDO rc-update add docker boot
            fi
        else
            echo "Skipping Docker service management (requires elevated permissions)."
        fi
        ;;
    *)
        echo "Warning: Unsupported platform '$PLATFORM'. Skipping Docker setup."
        ;;
esac

# ============================================================
echo ""
echo "=== [3/7] Python environment (uv) ==="
# ============================================================

if command -v uv &> /dev/null; then
    echo "uv is installed."
    uv --version
else
    echo "uv is not installed. Installing..."
    # https://docs.astral.sh/uv/getting-started/installation/
    fetch_url https://astral.sh/uv/install.sh | sh
    # Add uv to PATH for the rest of this session
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install the Python version pinned in .python-version (like nvm reads .nvmrc)
uv python install
echo "Python $(uv run python --version 2>&1 | awk '{print $2}') installed."

if [ -d ".venv" ]; then
    echo "Python virtual environment (.venv) already exists."
else
    echo "Creating Python virtual environment..."
    uv venv --managed-python .venv
fi
source .venv/bin/activate

echo "Installing Python dependencies..."
uv sync

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

# Restore the shell options and terminal settings that were active before this script ran.
eval "$_install_saved_opts"
[[ -n "$_install_saved_stty" ]] && stty "$_install_saved_stty" 2>/dev/null || true
unset _install_saved_opts _install_saved_stty
