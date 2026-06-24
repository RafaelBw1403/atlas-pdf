FROM node:20-bookworm-slim AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends weasyprint && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false && \
    npm config set fetch-retries 5 && \
    npm config set fetch-timeout 120000 && \
    npm install

COPY . .
RUN npm run build

FROM node:20-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends weasyprint && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_TLS_REJECT_UNAUTHORIZED=0
EXPOSE 3001
CMD ["node", "--enable-source-maps", "dist/server.js"]
