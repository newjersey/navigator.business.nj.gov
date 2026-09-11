FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS dependencies
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/content-types/package.json packages/content-types/package.json
COPY packages/static-site/package.json packages/static-site/package.json

# `--filter @businessnjgovnavigator/static-site...` resolves static-site's real
# workspace dependency closure (content-types only); the rest of the root
# workspace's manifests aren't needed for this image.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --filter @businessnjgovnavigator/static-site...

FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_WEB_BASE_URL
ARG NEXT_PUBLIC_MULTILINGUAL_ENABLED
ARG NEXT_PUBLIC_FEEDBACK_WIDGET_MODE
ARG NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED

COPY --from=dependencies /app ./
COPY packages/content-types packages/content-types
COPY packages/static-site packages/static-site
COPY content/lib content/lib
COPY content/src content/src

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_WEB_BASE_URL=$NEXT_PUBLIC_WEB_BASE_URL
ENV NEXT_PUBLIC_MULTILINGUAL_ENABLED=$NEXT_PUBLIC_MULTILINGUAL_ENABLED
ENV NEXT_PUBLIC_FEEDBACK_WIDGET_MODE=$NEXT_PUBLIC_FEEDBACK_WIDGET_MODE
ENV NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED=$NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED
RUN pnpm --filter @businessnjgovnavigator/content-types run build
RUN pnpm --filter @businessnjgovnavigator/static-site run build

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

COPY --from=builder --chown=nextjs:nodejs /app/packages/static-site/public ./packages/static-site/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/static-site/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/static-site/.next/static ./packages/static-site/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/content /app/content

USER nextjs
WORKDIR /app/packages/static-site

EXPOSE 3000

CMD ["node", "server.js"]
