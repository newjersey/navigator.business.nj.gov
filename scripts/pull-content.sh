#!/usr/bin/env bash
cd $(git rev-parse --show-toplevel)

TAG="$@";

if [ -z $TAG ]; then
    TAG="main";
fi

git subtree pull --prefix content git@github.com:newjersey/navigator-content.git $TAG --squash -m "chore: content merge"