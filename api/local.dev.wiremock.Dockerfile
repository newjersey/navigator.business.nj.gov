FROM node:22-bullseye AS base

RUN corepack enable

RUN  apt-get update && \
            apt-get install -y default-jre

WORKDIR /workspace


COPY package.json yarn.lock ./
COPY .yarn ./.yarn/
COPY .yarnrc.yml ./

COPY api/package.json ./api/
COPY content/package.json ./content/
COPY shared/package.json ./shared/

RUN yarn install --immutable

CMD ["yarn", "start:wiremock"]
