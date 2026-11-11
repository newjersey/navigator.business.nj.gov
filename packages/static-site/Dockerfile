FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
ENV PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false

COPY package.json /tmp/pnpm-package.json
RUN wget -qO /tmp/install-pnpm.sh https://get.pnpm.io/install.sh \
  && PNPM_VERSION="$(node -p 'require("/tmp/pnpm-package.json").packageManager.split("@")[1].split("+")[0]')" \
    PNPM_NO_MODIFY_PATH=1 SHELL=/bin/sh sh /tmp/install-pnpm.sh \
  && test "$(pnpm --version)" = "12.18.0" \
  && rm /tmp/install-pnpm.sh /tmp/pnpm-package.json

FROM base AS dependencies
WORKDIR /source

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/package.json
COPY api/cdk/package.json api/cdk/package.json
COPY api/src/functions/messagingService/reactEmail/package.json api/src/functions/messagingService/reactEmail/package.json
COPY content/package.json content/package.json
COPY packages/content-types/package.json packages/content-types/package.json
COPY packages/static-site/package.json packages/static-site/package.json
COPY shared/package.json shared/package.json
COPY web/package.json web/package.json
COPY packages/content-types packages/content-types
COPY packages/static-site packages/static-site
RUN pnpm --filter @businessnjgovnavigator/content-types deploy /tmp/content-types --network-concurrency=4 --child-concurrency=2 \
  && /tmp/content-types/node_modules/.bin/tsc --build /source/packages/content-types/tsconfig.json \
  && pnpm --filter @businessnjgovnavigator/static-site deploy /app/packages/static-site --network-concurrency=4 --child-concurrency=2

FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_WEB_BASE_URL
ARG NEXT_PUBLIC_MULTILINGUAL_ENABLED
ARG NEXT_PUBLIC_FEEDBACK_WIDGET_MODE
ARG NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED
ARG NEXT_PUBLIC_API_BASE_URL

COPY --from=dependencies /app /app
COPY content/lib content/lib
COPY content/src content/src

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_WEB_BASE_URL=$NEXT_PUBLIC_WEB_BASE_URL
ENV NEXT_PUBLIC_MULTILINGUAL_ENABLED=$NEXT_PUBLIC_MULTILINGUAL_ENABLED
ENV NEXT_PUBLIC_FEEDBACK_WIDGET_MODE=$NEXT_PUBLIC_FEEDBACK_WIDGET_MODE
ENV NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED=$NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN pnpm --dir packages/static-site run build

FROM node:24-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="Business.NJ.gov static site"
LABEL org.opencontainers.image.description="Next.js static site for Business.NJ.gov"
LABEL org.opencontainers.image.source="https://github.com/newjersey/navigator.business.nj.gov"
LABEL org.opencontainers.image.vendor="New Jersey Innovation Authority"
LABEL org.opencontainers.image.licenses="MIT"

ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nodejs
RUN adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/packages/static-site/.next/standalone /app
COPY --from=builder --chown=nextjs:nodejs /app/packages/static-site/public /app/packages/static-site/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/static-site/.next/static /app/packages/static-site/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/content /app/content

USER nextjs
WORKDIR /app/packages/static-site

EXPOSE 3000

CMD ["node", "server.js"]
