FROM node:14.19.1-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
COPY yarn.lock yarn.lock
COPY ./content/package.json ./content/package.json
COPY ./shared/package.json ./shared/package.json
COPY ./api/package.json ./api/package.json
COPY ./web/package.json ./web/package.json
COPY ./package.json ./package.json

WORKDIR /app/web
RUN yarn workspaces focus --production
WORKDIR /app

FROM builder AS runner
RUN apk --no-cache add curl
RUN rm -rf ./.yarn/cache
RUN rm -rf ./shared
RUN rm -rf ./api
RUN rm -rf ./content
COPY ./web/public ./web/public
COPY ./web/.next ./web/.next
WORKDIR /app/web

EXPOSE 3000
CMD ["yarn", "start"]