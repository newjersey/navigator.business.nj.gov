# syntax=docker/dockerfile:1

FROM node:24.22.3-alpine AS dependencies

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"

COPY package.json /tmp/pnpm-package.json
RUN wget -qO /tmp/install-pnpm.sh https://get.pnpm.io/install.sh \
  && PNPM_VERSION="$(node -p 'require("/tmp/pnpm-package.json").packageManager.split("@")[1].split("+")[0]')" \
    PNPM_NO_MODIFY_PATH=1 SHELL=/bin/sh sh /tmp/install-pnpm.sh \
  && rm /tmp/install-pnpm.sh /tmp/pnpm-package.json

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/package.json
COPY api/cdk/package.json api/cdk/package.json
COPY api/src/functions/messagingService/reactEmail/package.json \
  api/src/functions/messagingService/reactEmail/package.json
COPY content/package.json content/package.json
COPY packages/content-types/package.json packages/content-types/package.json
COPY packages/static-site/package.json packages/static-site/package.json
COPY shared/package.json shared/package.json
COPY web/package.json web/package.json

RUN pnpm --filter @businessnjgovnavigator/content-types \
  --filter @businessnjgovnavigator/content \
  --filter @businessnjgovnavigator/shared \
  --filter @businessnjgovnavigator/web install --frozen-lockfile --network-concurrency=4 --child-concurrency=2

FROM dependencies AS builder

ENV NEXT_TELEMETRY_DISABLED=1

COPY jest.shared.ts jest.shared.ts
COPY content content
COPY packages/content-types packages/content-types
COPY shared shared
COPY web web

RUN pnpm --filter @businessnjgovnavigator/content-types run build \
  && pnpm --filter @businessnjgovnavigator/content run build \
  && pnpm --filter @businessnjgovnavigator/shared run build

RUN --mount=type=secret,id=web-build-environment,target=/app/web/.env.production,required=true \
  pnpm --filter @businessnjgovnavigator/web run build \
  && rm -f /app/web/.next/standalone/web/.env.production \
  && ! find /app/web/.next/standalone -name ".env*" -print | grep -q .

FROM node:24.22.3-alpine AS runner

WORKDIR /app

ENV HOSTNAME=0.0.0.0 \
  NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000

# The ECS task definitions that run this image define their own container health check as
# `curl -f http://localhost:3000/healthz`, independent of this image's own Node-based HEALTHCHECK
# below. Keep curl installed so this image satisfies both checks.
RUN apk --no-cache add curl

COPY --from=builder --chown=node:node /app/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/web/.next/static ./web/.next/static
COPY --from=builder --chown=node:node /app/web/public ./web/public
COPY --chown=node:node scripts/healthcheck-web.mjs ./scripts/healthcheck-web.mjs

USER node
WORKDIR /app/web

EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=5s --start-period=30s --retries=12 \
  CMD ["node", "/app/scripts/healthcheck-web.mjs"]

# Fargate's awsvpc network mode injects its own task-specific HOSTNAME into the
# container environment, overriding the ENV HOSTNAME=0.0.0.0 set above. That
# causes the standalone Next.js server to bind only to the task's ENI address,
# so ECS's own `curl http://localhost:3000/healthz` container health check
# fails even though the ALB health check (which targets the ENI address)
# succeeds. Re-assign HOSTNAME here so it always wins at process start,
# regardless of what the container runtime injects.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
