FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS dependencies
WORKDIR /app

COPY packages/content-types /content-types
COPY packages/static-site/package.json packages/static-site/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_WEB_BASE_URL
ARG NEXT_PUBLIC_MULTILINGUAL_ENABLED

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /content-types /content-types
COPY packages/static-site .
COPY content/lib /content/lib
COPY content/src /content/src

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_WEB_BASE_URL=$NEXT_PUBLIC_WEB_BASE_URL
ENV NEXT_PUBLIC_MULTILINGUAL_ENABLED=$NEXT_PUBLIC_MULTILINGUAL_ENABLED
RUN pnpm exec tsc --build /content-types/tsconfig.json
RUN pnpm build

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

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /content /content

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
