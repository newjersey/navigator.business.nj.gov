FROM node:22-bullseye AS base

RUN corepack enable

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY .yarn ./.yarn/
COPY .yarnrc.yml ./

COPY web/package.json ./web/
COPY shared/package.json ./shared/

RUN yarn install --immutable

CMD ["yarn", "dev"]
