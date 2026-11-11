FROM node:22-bullseye AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
COPY package.json /tmp/pnpm-package.json
RUN curl -fsSL https://get.pnpm.io/install.sh -o /tmp/install-pnpm.sh \
  && PNPM_VERSION="$(node -p 'require("/tmp/pnpm-package.json").packageManager.split("@")[1].split("+")[0]')" \
    PNPM_NO_MODIFY_PATH=1 SHELL=/bin/sh sh /tmp/install-pnpm.sh \
  && rm /tmp/install-pnpm.sh /tmp/pnpm-package.json

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY api/package.json ./api/
COPY api/cdk/package.json ./api/cdk/
COPY api/src/functions/messagingService/reactEmail/package.json ./api/src/functions/messagingService/reactEmail/
COPY content/package.json ./content/
COPY packages/content-types/package.json ./packages/content-types/
COPY packages/static-site/package.json ./packages/static-site/
COPY shared/package.json ./shared/
COPY web/package.json ./web/

RUN pnpm --filter @businessnjgovnavigator/api... install --frozen-lockfile --network-concurrency=4 --child-concurrency=2

CMD ["./scripts/start-all-lambdas.sh"]
