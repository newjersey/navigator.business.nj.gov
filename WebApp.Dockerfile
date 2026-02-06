FROM node:24.12.0-alpine AS deps

WORKDIR /app

# Install build dependencies needed for native modules (sharp, esbuild, etc.)
RUN apk add --no-cache python3 make g++

# Skip puppeteer's chromium download and postinstall (not needed for build)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_SKIP_DOWNLOAD=true

COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
COPY yarn.lock yarn.lock
COPY ./content/package.json ./content/package.json
COPY ./shared/package.json ./shared/package.json
COPY ./api/package.json ./api/package.json
COPY ./web/package.json ./web/package.json
COPY ./package.json ./package.json

# Install all dependencies (including devDependencies like TypeScript) needed for build
WORKDIR /app/web
RUN yarn workspaces focus

# Production dependencies stage - install only what's needed at runtime
FROM node:24.12.0-alpine AS prod-deps

WORKDIR /app

COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
COPY yarn.lock yarn.lock
COPY ./content/package.json ./content/package.json
COPY ./shared/package.json ./shared/package.json
COPY ./web/package.json ./web/package.json
COPY ./package.json ./package.json

# Install production dependencies only
ENV NODE_ENV=production
WORKDIR /app/web
RUN yarn workspaces focus --production

FROM node:24.12.0-alpine AS builder

WORKDIR /app

# Copy all dependencies from deps stage (workspaces may hoist to root)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=deps /app/yarn.lock ./yarn.lock

# Copy source code
COPY ./package.json ./package.json
COPY ./jest.shared.ts ./jest.shared.ts
COPY ./content ./content
COPY ./shared ./shared
COPY ./web ./web

WORKDIR /app/web

# Build the Next.js app
# NOTE: Environment variables are provided via .env.production file created by the CI/CD pipeline
RUN yarn build

FROM node:24.12.0-alpine AS runner
RUN apk --no-cache add curl bash

WORKDIR /app

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy standalone output from builder
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public
COPY ./scripts/healthcheck-web.sh /app/scripts/healthcheck-web.sh

WORKDIR /app/web

# Set the port for standalone server
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=30s --start-period=90s --retries=5 \
  CMD /app/scripts/healthcheck-web.sh || exit 1

# Use Node.js directly with standalone server
CMD ["node", "server.js"]
