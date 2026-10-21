# AGENTS.md — running this repository in the Base44 sandbox

## Layout
- The repo root holds a single project, `pageforge/`: a Vite + React 18 SPA
  (`"type": "module"`, TypeScript). There is **no local backend service**: `py.py` is
  a one-off local code-patch script. `base44/functions/pageforgeCopilot.ts` is the
  app's Base44 backend function (Deno `Deno.serve` handler) — it runs on the Base44
  platform, never in this sandbox.
- Everything is client-side. Data comes from `localStorage`
  (`src/lib/local.ts`, `src/lib/useStore.ts`): workspaces, sites, leads, events.
  No database, API, queue or external credential is needed to boot.
- Login is a local simulation, not real auth: demo personas `demo-ana` (Ana Costa)
  and `demo-bruno` (Bruno Lima) live in `src/lib/local.ts`, plus accounts created
  in the browser (`src/lib/localAccounts.ts`).
- The AI copilot's "Base44 (real)" mode calls the app's own backend function
  `pageforgeCopilot` (`pageforge/base44/functions/pageforgeCopilot.ts`, a Deno
  `Deno.serve` handler) through the SDK, so it needs no user configuration:
  `VITE_BASE44_APP_ID` is read first and, when empty, the app id the Base44
  platform injects into every published page (`<script data-app-id>`) is used.
  The sandbox page has no injected id, so `docker-compose.base44.yml` passes the
  app's public app id to the dev server; without any id the panel reports it.
  The function is deployed only with the published app — calling it before that
  returns `Function not found` (HTTP 404) and the panel shows that message.
  `VITE_PAGEFORGE_AI_ENDPOINT` is now an optional override (self-hosted endpoint);
  mock mode needs nothing.

## How to run it here
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
```
- Host port 3000 → container 5173, Vite dev server with `--host 0.0.0.0`.
- **Why the override matters:** `package.json`'s `dev` script is
  `vite --host 127.0.0.1`. Inside a container that binds loopback *inside the
  container only*, so the published port answers nothing and the preview never
  starts (`curl http://localhost:3000/` → connection refused). The compose command
  overrides the host to `0.0.0.0`; keep that override. This is the sandbox-side
  fix deliberately — the loopback default stays untouched for a developer's own
  machine.
- `node_modules` is a named Compose volume, synced from `pageforge/package-lock.json`
  with `npm ci` on every container start (never into the bind mount, so the repo
  checkout stays clean). No image build step for app code.
- The preview hostname is accepted because the platform exports
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, which Vite >= 6.1 appends to
  `server.allowedHosts`. No `vite.config.ts` change is needed; never hardcode
  `BASE44_*` host values in a file.
- Health: the Compose healthcheck fetches `/` with the image's `wget`.

## Verify a change
- HMR is on, so edits under `pageforge/src` appear without a restart. Compose,
  env or dependency changes need a preview reload.
- Checks (fast; do not run the full build for routine verification):
  ```bash
  docker compose -f docker-compose.base44.yml exec -T web npm run check   # tsc --noEmit
  docker compose -f docker-compose.base44.yml exec -T web npm test        # vitest, node env
  ```
  `docker compose ... exec -T web npm run build` (tsc -b + vite build) also passes;
  it writes `dist/`, which is gitignored.
- Manual smoke: `/` → login screen → pick a demo persona → `/dashboard` →
  a card's edit button → `/editor/:id` → `/preview/:id` → `/leads`, `/analytics`.
  Published sites render at `/p/:slug`.
- The app's own sign-in does a real `location.href` navigation, and the platform
  preview browser does not keep a local session between fresh loads, so the
  signed-in screens are best verified by driving the login gesture and the
  assertions inside one browser run (a headless Chromium against port 3000 works).

## Gotchas found while running this branch
- `tests/security.test.ts` asserted the old Portuguese message `'Acesso negado'`
  while `src/lib/security.ts` (English app since the import commit) throws
  `'Access denied'`; `npm test` failed with 1 of 6 tests. The expectation is
  aligned with the code — keep test copy in sync with the UI language.
- `pageforge/src/components/Editor.tsx.backup-20261020-162552` is a stray local
  backup. It is not a `.ts`/`.tsx` file, so neither `tsc` nor Vite picks it up.
- The first request to a cold dev server has to transform ~1,700 modules and
  ~130 CSS files; give the first preview load a moment before judging it.
- `python3 py.py` is a patch installer for an older responsive revision and exits
  with "Responsividade V1 ja instalada" once its patch is in the tree — that is
  expected, not a failure of the app.
