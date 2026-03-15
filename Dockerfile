FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node ace build --ignore-ts-errors

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/build ./
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV PORT=3333
EXPOSE 3333

CMD ["sh", "-c", "node ace migration:run --force && node ace db:seed && node bin/server.js"]
