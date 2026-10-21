# Agent notes (Base44 sandbox)

## Layout

- The app is **not** at the repo root: the Vite + React + TypeScript SPA lives in `pageforge/`.
  All npm commands run from `pageforge/`, not from the root.
- `pageforge/py.py` is a legacy one-off installer that rewrites CSS files; it is not part
  of the run/verify flow. `pageforge/base44/functions/pageforgeCopilot.ts` is a contract
  skeleton, not a deployed function.

## Running it here

```bash
docker compose -f docker-compose.base44.yml up -d --build   # from the repo root
docker compose -f docker-compose.base44.yml logs -f web
```

- Two services: `web` on host port **3000** (`node:22-slim`, Vite dev server from the
  bind-mounted source) and `api` (`node server/copilot.mjs`, internal port 8787, the AI
  copilot backend). There is no database or migration step.
- `vite.config.ts` proxies `/api` to `$AI_PROXY_TARGET` (compose sets `http://api:8787`), so
  the browser talks to the copilot on the same origin. Restart `api` after editing
  `pageforge/server/copilot.mjs` (plain `node`, no watcher); `web` hot-reloads.
- Dependencies are installed at container start with `npm ci` into the named volume
  `pageforge_node_modules` (the source bind mount would otherwise hide them). Editing
  `package.json`/`package-lock.json` needs a `docker compose ... up -d` (re-runs `npm ci`),
  not an image rebuild.
- `pageforge/vite.config.ts` sets port 5173; the compose command overrides it with
  `--port 3000 --strictPort` and binds `0.0.0.0`. Do not "fix" the 5173 default in the config.
- Vite resolves to 6.4.4, which appends `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` to
  `server.allowedHosts`; compose passes that platform variable through, so no allowlist
  edit in `vite.config.ts` is needed.

## Data and credentials

- Default mode stores everything in the browser `localStorage` (the `VITE_DATA_PROVIDER`
  value in `.env.example` is not actually read). No external service is required to run.
- The AI Design Copilot ("IA real (API)") posts to `/api/copilot`, handled by
  `pageforge/server/copilot.mjs`. It calls an **OpenAI-compatible** provider using the
  platform secret `AI_API_KEY` (see `/run/base44/app.env`); `.env.base44-defaults` holds the
  non-secret `AI_BASE_URL` / `AI_MODEL` defaults so the dashboard can override them. Without
  `AI_API_KEY` the API answers 503 and the editor's "Mock (sem API)" mode still works.
- Provider failures are returned as 4xx (429 when the provider is rate limited, 422
  otherwise) on purpose: the preview proxy replaces any 5xx body with its own "Preview
  starting…" page, which would hide the provider's message from the UI.
- The optional Base44 integration (`pageforge/src/integrations/base44.ts`) needs
  `VITE_BASE44_APP_ID` plus provisioned `PFWorkspace`/`PFSite`/`PFLead`/`PFEvent` entities.

## Deploy (produção)

- `Dockerfile` na raiz: build do Vite + `pageforge/server/production.mjs` (arquivos
  estáticos de `dist/` com fallback do SPA + `/api/copilot` + `/healthz`) na mesma porta
  (`PORT`, padrão 3000). Detalhes em `pageforge/DEPLOY.md`.
- `server/copilot.mjs` exporta `createCopilotHandler()`; rodar o arquivo direto (como o
  compose de dev faz) continua subindo o servidor isolado na porta 8787.
- Smoke test da imagem: `docker build -t pageforge . && docker run -p 3100:3000 -e
  AI_API_KEY=... pageforge`, depois `curl -s localhost:3100/healthz`. Use `-e`, nunca
  `--env-file /run/base44/app.env` — o valor desse arquivo vem entre aspas e o Docker não
  as remove, resultando em 401 do provedor.
- Vercel/Netlify não executam esse servidor Node: só o site estático, sem o copiloto.

## Verifying

- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → 200, and
  `curl -s http://localhost:3000/src/main.tsx` returns unhashed module source (proves the
  dev server, not a prebuilt bundle, is serving).
- Sign-in is a **full page load** (`location.href = '/dashboard'`), which ends any script
  driving it. Combined with the sandbox preview browser resetting `localStorage` for
  anonymous visitors between calls, the signed-in screens (dashboard, editor, leads,
  analytics) cannot be verified automatically as an anonymous visitor: they need the
  user's replayed preview session, or manual checking in their own preview.
- Types/tests exist as `npm run check` (tsc --noEmit) and `npm run test` (vitest) — not run
  during setup.
