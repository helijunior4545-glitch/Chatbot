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

- Single service (`web`) on host port **3000**, `node:22-slim` running the Vite dev server
  from the bind-mounted source, so edits apply live. There is no backend, database or
  migration step.
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
- The AI Design Copilot uses a deterministic **mock** mode by default. The real path needs
  `VITE_PAGEFORGE_AI_ENDPOINT` pointing at an authenticated backend function; without it the
  "Base44 (real)" option fails by design.
- The optional Base44 integration (`pageforge/src/integrations/base44.ts`) needs
  `VITE_BASE44_APP_ID` plus provisioned `PFWorkspace`/`PFSite`/`PFLead`/`PFEvent` entities.

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
