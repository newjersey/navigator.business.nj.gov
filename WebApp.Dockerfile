FROM node:14.19.0-buster as runner

WORKDIR /app
ENV NODE_ENV production

COPY ./web/public ./public
COPY ./web/.next ./.next
COPY ./node_modules ./node_modules
COPY ./web/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]