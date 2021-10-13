#!/usr/bin/env bash

cd $(git rev-parse --show-toplevel)

set -e

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

# run tests, feature tests, and push
 ./scripts/pre-commit.sh && ./scripts/feature-tests.sh && git push "$@" && print_success