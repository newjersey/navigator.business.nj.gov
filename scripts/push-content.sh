#!/usr/bin/env bash
cd $(git rev-parse --show-toplevel)

TAG="$@";

if [ -z $TAG ]; then
    TAG="main";
fi

git subtree push --prefix content git@github.com:newjersey/navigator-content.git $TAG