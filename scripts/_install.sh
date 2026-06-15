#!/usr/bin/env zsh
set -euo pipefail

# Setup script to setup machine for local development

# Always run from the repo root so that .nvmrc, .venv, yarn.lock, etc. resolve correctly
cd "${0:a:h:h}"

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
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "Warning: Not running as root and sudo is not available. Steps requiring elevated permissions will be skipped."
    fi
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
            brew install colima
        fi

        if command -v docker &> /dev/null; then
            echo "Docker CLI is installed."
            docker --version
        else
            echo "Docker CLI is not installed. Installing..."
            brew install docker
        fi

        for _pkg in docker-compose docker-buildx; do
            if brew list "$_pkg" &> /dev/null; then
                echo "$_pkg is installed."
            else
                echo "$_pkg is not installed. Installing..."
                brew install "$_pkg"
            fi
        done

        # Wire Docker CLI to Homebrew's plugin directory so `docker compose` and
        # `docker buildx` work without manual symlinks.
        BREW_PREFIX="$(brew --prefix)"
        _DOCKER_CONFIG="$HOME/.docker/config.json"
        _plugin_dir="${BREW_PREFIX}/lib/docker/cli-plugins"
        mkdir -p "$HOME/.docker"

        if [ ! -f "$_DOCKER_CONFIG" ]; then
            printf '{\n  "cliPluginsExtraDirs": ["%s"]\n}\n' "$_plugin_dir" > "$_DOCKER_CONFIG"
            echo "Created ~/.docker/config.json with cliPluginsExtraDirs."
        elif grep -qF "$_plugin_dir" "$_DOCKER_CONFIG" 2> /dev/null; then
            echo "~/.docker/config.json already has cliPluginsExtraDirs."
        else
            echo "Adding cliPluginsExtraDirs to existing ~/.docker/config.json..."
            BREW_PREFIX="$BREW_PREFIX" python3 - <<'PYEOF'
import json, os
path = os.path.expanduser("~/.docker/config.json")
with open(path) as f:
    cfg = json.load(f)
d = f"{os.environ['BREW_PREFIX']}/lib/docker/cli-plugins"
dirs = cfg.setdefault("cliPluginsExtraDirs", [])
if d not in dirs:
    dirs.append(d)
with open(path, "w") as f:
    json.dump(cfg, f, indent=2)
PYEOF
        fi

        # Fallback: add user-level buildx symlink if the plugin is still unreachable.
        if ! docker buildx version &> /dev/null; then
            echo "Adding docker-buildx user-level symlink..."
            mkdir -p "$HOME/.docker/cli-plugins"
            ln -sfn "${BREW_PREFIX}/opt/docker-buildx/bin/docker-buildx" \
                "$HOME/.docker/cli-plugins/docker-buildx"
        fi

        # Rosetta is required for linux/amd64 containers on Apple Silicon.
        if pkgutil --pkg-info com.apple.pkg.RosettaUpdateAuto &> /dev/null; then
            echo "Rosetta is installed."
        else
            echo "Installing Rosetta..."
            /usr/sbin/softwareupdate --install-rosetta --agree-to-license
        fi

        # Detect whether the existing Colima VM uses the required settings.
        # vmType, arch, and mountType are fixed at VM creation time and cannot
        # be changed in-place — the VM must be deleted and recreated.
        _COLIMA_YAML="$HOME/.colima/default/colima.yaml"
        _needs_migration=false

        if [ -f "$_COLIMA_YAML" ]; then
            if ! grep -q "vmType: vz" "$_COLIMA_YAML" || \
               ! grep -q "rosetta: true" "$_COLIMA_YAML" || \
               ! grep -q "mountType: virtiofs" "$_COLIMA_YAML"; then
                _needs_migration=true
            fi
        fi

        if [ "$_needs_migration" = true ]; then
            echo ""
            echo "WARNING: Existing Colima VM does not use the required VZ/Rosetta/virtiofs"
            echo "         settings. This will DELETE all containers, images, volumes, and the"
            echo "         current VM. Back up any important data now. Press Ctrl-C to abort."
            echo ""
            for _i in $(seq 10 -1 1); do
                printf "\r  Migrating in %2d seconds..." "$_i"
                sleep 1
            done
            echo ""

            brew services stop colima || true
            # Start manually so Docker can remove objects before the VM is deleted.
            if ! colima status &> /dev/null; then
                colima start || true
            fi
            docker ps -aq | while read -r _cid; do docker rm -f "$_cid"; done
            docker system prune -a --volumes -f || true
            docker volume prune -a -f || true
            docker builder prune -a -f || true
            colima stop || true
            colima delete --force || true
        fi

        # Initialize the VM on first install or immediately after migration.
        if [ ! -f "$_COLIMA_YAML" ]; then
            echo "Initializing Colima VM (VZ + Rosetta + virtiofs)..."
            brew services stop colima || true
            colima start \
                --vm-type vz \
                --vz-rosetta \
                --mount-type virtiofs \
                --arch aarch64 \
                --cpu 8 \
                --memory 16 \
                --disk 256 \
                --runtime docker
            colima stop
        fi

        # Ensure brew services owns the Colima lifecycle. If Colima is running
        # outside brew services (e.g. the developer ran `colima start` manually),
        # stop it so launchd can take over cleanly.
        _colima_running=false
        _brew_managing=false
        colima status &> /dev/null && _colima_running=true || true
        brew services list | grep -q "^colima.*started" && _brew_managing=true || true

        if [ "$_colima_running" = true ] && [ "$_brew_managing" = false ]; then
            echo "Colima is running outside brew services. Stopping manual instance..."
            brew services stop colima || true
            colima stop
        fi

        if [ "$_needs_migration" = true ]; then
            brew services restart colima
        elif [ "$_brew_managing" = true ]; then
            echo "Colima brew service is already started."
        else
            echo "Starting Colima brew service..."
            brew services start colima
        fi

        # Wait for the VM to be ready (brew services returns before the VM has booted).
        echo "Waiting for Colima to be ready..."
        for i in $(seq 1 30); do
            if colima status &> /dev/null; then
                echo "Colima is ready."
                break
            fi
            if [ "$i" -eq 30 ]; then
                echo "Error: Colima failed to start within 60 seconds."
                echo "Debug: brew services list; tail $(brew --prefix)/var/log/colima.log"
                exit 1
            fi
            sleep 2
        done
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

if ! command -v nvm &> /dev/null; then
    echo "Error: nvm failed to load. Try opening a new terminal and re-running the script."
    exit 1
fi

# Install and use the Node version pinned in .nvmrc
nvm install

# ============================================================
echo ""
echo "=== [5/7] Package managers (Yarn + pnpm) ==="
# ============================================================

corepack enable && echo "Corepack enabled." || { echo "Failed to enable corepack."; exit 1; }
corepack prepare yarn@latest --activate && echo "Yarn activated." || { echo "Failed to activate Yarn."; exit 1; }
corepack prepare pnpm@latest --activate && echo "pnpm activated." || { echo "Failed to activate pnpm."; exit 1; }

# ============================================================
echo ""
echo "=== [6/7] Install dependencies and build ==="
# ============================================================

yarn install && yarn build || { echo "Root install or build failed."; exit 1; }
(
    cd packages/static-site
    pnpm install
    # Playwright drives the static-site accessibility and e2e suites; install the
    # browsers here (dev/CI only) rather than via a package postinstall, which
    # would also pull Chromium into production Docker image builds. The headless
    # shell is a separate download from full Chromium and is what the headless
    # test runs actually launch.
    pnpm exec playwright install chromium chromium-headless-shell
    pnpm build
) || {
    echo "Static-site install or build failed."
    exit 1
}
echo "Dependencies installed and projects built."

# ============================================================
echo ""
echo "=== [7/7] Git hooks (Husky) ==="
# ============================================================

yarn run prepare && echo "Git hooks installed." || { echo "Failed to install git hooks."; exit 1; }
