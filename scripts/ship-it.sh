#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

set -e

npm run typecheck

# format files
npm run prettier

# check if uncommited changes
changed_files=$(git status --porcelain | wc -l)
if [ $changed_files -ne 0 ]; then
  git status
  echo
  echo "^^^YOU GOT SOME UNCOMMITTED CHANGES IN 'ERE"
  echo
  exit 1
fi

function print_success {
  echo ""
  echo "███████╗██╗  ██╗██╗██████╗ ██████╗ ███████╗██████╗     ██╗████████╗██╗"
  echo "██╔════╝██║  ██║██║██╔══██╗██╔══██╗██╔════╝██╔══██╗    ██║╚══██╔══╝██║"
  echo "███████╗███████║██║██████╔╝██████╔╝█████╗  ██║  ██║    ██║   ██║   ██║"
  echo "╚════██║██╔══██║██║██╔═══╝ ██╔═══╝ ██╔══╝  ██║  ██║    ██║   ██║   ╚═╝"
  echo "███████║██║  ██║██║██║     ██║     ███████╗██████╔╝    ██║   ██║   ██╗"
  echo "╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝     ╚══════╝╚═════╝     ╚═╝   ╚═╝   ╚═╝"
  echo "                                                                      "
}

npm --prefix=web run fences
npm --prefix=api run fences

# run tests, feature tests, and push
npm --prefix=web run lint && npm --prefix=api run lint && ./scripts/test.sh && ./scripts/feature-tests.sh && git push && print_success
