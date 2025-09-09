FROM node:22-bullseye AS base

RUN corepack enable

WORKDIR /workspace

COPY package.json yarn.lock ./
COPY .yarn ./.yarn/
COPY .yarnrc.yml ./

COPY api/package.json ./api/
COPY content/package.json ./content/
COPY shared/package.json ./shared/

RUN yarn install --immutable

CMD ["./scripts/start-all-lambdas.sh"]
