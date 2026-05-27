# Multi-stage: Vite production build → nginx static serve (browser-only app).

FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache bash

COPY package.json package-lock.json ./
RUN npm ci

COPY scripts/ensure-native-deps.sh scripts/ensure-native-deps.sh
RUN bash scripts/ensure-native-deps.sh

COPY . .

ARG GEMINI_API_KEY=
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

RUN npm run build

FROM nginx:alpine AS runtime

RUN apk add --no-cache curl

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
