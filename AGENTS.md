# AGENTS.md — running this repository in the Base44 sandbox

## Layout
- The repo root only holds the single project `pageforge/` — a Vite + React 18 SPA
  (`type: module`, TypeScript). There is **no backend service**: `py.py` is a
  one-off local code patch script, `base44/functions/pageforgeCopilot.ts` is an
  unused contract skeleton.
- Everything is client-side. The default data provider is local: workspaces,
  sites, leads and events are persisted in the browser's `localStorage`
  (`src/lib/local.ts`, `src/lib/useStore.ts`). No database, API or secret is
  needed to boot; `VITE_DATA_PROVIDER` is documented but not read anywhere.
- Login is a local simulation, not real auth: demo personas `demo-ana`
  (Ana Costa) and `demo-bruno` (Bruno Lima) from `src/lib/local.ts`, plus
  accounts created in the browser (`src/lib/localAccounts.ts`).

## How to run it here
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
```
- Host port 3000 → container 5173 (Vite dev server, `--host 0.0.0.0`).
  `package.json`'s `dev` script binds `127.0.0.1`, which the compose command
  overrides; keep that override or the preview cannot reach the server.
- `node_modules` is installed at container start with `npm ci` (lockfile
  preserved) into the bind-mounted project directory — it is gitignored and is
  not shipped to other branches. There is no image build step for app code.
- The preview hostname is accepted because the platform exports
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, which Vite >= 6.1 appends to
  `server.allowedHosts`. No `vite.config.ts` change is needed; do not hardcode
  `BASE44_*` host values anywhere.

## Verify a change
- Dev server has HMR, so source edits under `pageforge/src` show up without a
  restart; compose/env/dependency changes need a reload of the preview.
- Checks: `docker compose -f docker-compose.base44.yml exec web npm run check`
  (tsc, no emit) and `... exec web npm test` (vitest, `environment: node`,
  covers `tests/security.test.ts`). Both are fast; do not run a full build.
- Manual smoke: `/` → login screen → pick a demo persona → `/dashboard` →
  open a site's editor (`/editor/:id`) → `/preview/:id` → `/leads`,
  `/analytics`; published sites render at `/p/:slug`.

## Optional external integration (not required to run)
- The AI Design Copilot works in deterministic mock mode with no configuration.
  Its "Base44 (real)" mode needs `VITE_PAGEFORGE_AI_ENDPOINT` pointing at a
  deployed, authenticated backend function implementing
  `POST {instruction, blocks, selectedId} → {operations, summary}`
  (see `PAGEFORGE_AI_BASE44_SETUP.md`); until then the panel stays in mock mode.
- `src/integrations/base44.ts` stays inert while `VITE_BASE44_APP_ID` is empty.
