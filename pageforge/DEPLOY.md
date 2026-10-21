# Publicar o PageForge como site estático

O app é uma SPA (Vite + React) sem back-end: os dados ficam no `localStorage` de cada
navegador. Publicar significa servir a pasta `dist/` de um build.

```bash
npm ci
npm run build   # gera pageforge/dist
```

## Requisito do host: rewrite de SPA

O app tem rotas de cliente (`/dashboard`, `/editor/:id`, `/p/:slug`). Sem rewrite, abrir
ou recarregar essas URLs dá 404. Cada host tem o seu:

| Host | Configuração |
| --- | --- |
| Docker / VPS | `Dockerfile` na raiz do repo (nginx com rewrite pronto): `docker build -t pageforge . && docker run -p 3000:80 pageforge` |
| Netlify | `_redirects` com `/*  /index.html  200` |
| Vercel | rewrite de `/(.*)` para `/index.html` |
| Cloudflare Pages | fallback de SPA nas configurações do projeto (ou `_redirects`) |
| GitHub Pages | rewrite é limitado: use o truque de `404.html` = `index.html` |

Build command `npm run build`, diretório de publicação `pageforge/dist` (ou `dist` com
root em `pageforge`).

## Verificação rápida

```bash
for u in / /dashboard /editor/abc /p/qualquer-slug; do
  curl -s -o /dev/null -w "$u -> %{http_code}\n" http://localhost:3000$u
done
```

Todos devem responder `200`.
