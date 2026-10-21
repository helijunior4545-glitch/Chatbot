# syntax=docker/dockerfile:1
# Publicação como site estático do PageForge: o build do Vite é servido pelo nginx
# com fallback de SPA (rotas /dashboard, /editor/:id e /p/:slug abrem direto).
#
#   docker build -t pageforge .
#   docker run -p 3000:80 pageforge
#
# Para desenvolvimento use docker-compose.base44.yml (Vite dev server na 3000).

FROM node:22-slim AS build
WORKDIR /app
COPY pageforge/package.json pageforge/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY pageforge/ ./
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY pageforge/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
