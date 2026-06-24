FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false && \
    npm install --legacy-peer-deps
COPY . .

ARG VITE_API_BACK_URL
ARG VITE_GRAPHQL_URL
ARG VITE_API_PDF_URL
ARG VITE_PROJECT_MODE
ARG CACHE_BUST=unknown

ENV VITE_API_BACK_URL=$VITE_API_BACK_URL
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_API_PDF_URL=$VITE_API_PDF_URL
ENV VITE_PROJECT_MODE=$VITE_PROJECT_MODE

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
