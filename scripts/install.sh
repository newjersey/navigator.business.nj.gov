#!/usr/bin/env zsh
# Usage: source scripts/install.sh
# Runs _install.sh in a subprocess, then configures the current shell
# so that nvm, Node, and the Python venv are immediately available.

_setup_dir="${0:a:h}"
if [[ "$_setup_dir" == */scripts ]]; then
  _setup_root="${_setup_dir:h}"
else
  _setup_root="$(cd "$(dirname "${(%):-%x}")" && cd .. && pwd)"
fi

"${_setup_root}/scripts/_install.sh" || { echo "Install failed."; return 1 2>/dev/null || exit 1; }

export PATH="$HOME/.local/bin:$PATH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm use

[ -d "${_setup_root}/.venv" ] && source "${_setup_root}/.venv/bin/activate"

unset _setup_dir _setup_root
echo ""
echo "Environment ready."
