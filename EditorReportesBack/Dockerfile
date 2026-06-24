FROM node:20-bookworm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
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
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/graphql/schema/*.graphql ./dist/graphql/schema/
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
EXPOSE 4000
CMD ["./entrypoint.sh"]