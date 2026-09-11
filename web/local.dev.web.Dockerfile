FROM node:22-bullseye AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# `--filter @businessnjgovnavigator/web...` resolves web's real workspace
# dependency closure (shared -> content -> content-types); only those
# manifests need to be present.
COPY web/package.json ./web/
COPY content/package.json ./content/
COPY packages/content-types/package.json ./packages/content-types/
COPY shared/package.json ./shared/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --filter @businessnjgovnavigator/web...

CMD ["pnpm", "dev"]
