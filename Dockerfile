# syntax=docker/dockerfile:1
# Imagem de produção do PageForge: site compilado (Vite) + copiloto de IA na mesma
# porta. Para desenvolvimento use docker-compose.base44.yml (Vite dev server).
#
#   docker build -t pageforge .
#   docker run -p 3000:3000 -e AI_API_KEY=... pageforge

FROM node:22-slim AS build
WORKDIR /app
COPY pageforge/package.json pageforge/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY pageforge/ ./
# O Vite inlina variáveis VITE_* no momento do build.
ARG VITE_PAGEFORGE_AI_ENDPOINT=/api/copilot
ARG VITE_BASE44_APP_ID=
ENV VITE_PAGEFORGE_AI_ENDPOINT=$VITE_PAGEFORGE_AI_ENDPOINT \
    VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID
RUN npm run build

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY pageforge/server ./server
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/production.mjs"]
