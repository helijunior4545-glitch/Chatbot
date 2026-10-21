# Deploy do PageForge (site + copiloto de IA)

O repositório tem um `Dockerfile` na raiz que gera **uma única imagem**: o site já
compilado (Vite → `dist/`) servido por `server/production.mjs`, com `/api/copilot`
atendido no mesmo processo e na mesma porta. Assim funciona em qualquer provedor de
container, com uma URL só e sem CORS.

## Rodar localmente (teste da imagem)

```bash
docker build -t pageforge .
docker run -p 3000:3000 -e AI_API_KEY=sua-chave pageforge
# http://localhost:3000
```

## Variáveis de ambiente

| Variável | Obrigatória | Para que serve |
| --- | --- | --- |
| `AI_API_KEY` | para o copiloto de IA | chave do provedor (OpenAI, OpenRouter, Groq…). Sem ela o app sobe e o modo "Mock (sem API)" continua funcionando. |
| `AI_BASE_URL` | não | endpoint compatível com OpenAI (padrão `https://api.openai.com/v1`). Ex.: `https://openrouter.ai/api/v1`. |
| `AI_MODEL` | não | modelo usado (padrão `gpt-4o-mini`). Ex.: `openai/gpt-4o-mini`. |
| `PORT` | não | porta HTTP (padrão `3000`; a maioria dos hosts define sozinha). |
| `STATIC_DIR` | não | pasta do build (padrão `dist`). |

O endpoint de saúde é `GET /healthz` (responde `{"ok":true,"configured":<tem chave>}`).

> Se for iniciar com `docker run --env-file`, cuidado: o Docker **não** remove aspas do
> arquivo. Use `-e AI_API_KEY=...` ou defina a variável no painel do provedor.

## Hospedar em qualquer provedor de container

Serve para Render, Railway, Fly.io, EasyPanel, Coolify, VPS com Docker, etc.:

1. Suba este repositório para o GitHub e crie um **Web Service** apontando para ele.
2. Tipo de deploy: **Dockerfile** (na raiz do repositório).
3. Porta: `3000` (ou a que o provedor injetar em `PORT`).
4. Variáveis: `AI_API_KEY` +, se quiser, `AI_BASE_URL`/`AI_MODEL`.
5. Health check: `/healthz`.
6. Deploy. A URL pública é a do próprio serviço.

Se o build precisar de outra rota de IA, passe `--build-arg VITE_PAGEFORGE_AI_ENDPOINT=...`
(esse valor é inlinado pelo Vite no build; o padrão `/api/copilot` funciona com esta imagem).

## Vercel / Netlify (somente estático)

Esses hosts não executam `server/production.mjs`. Dá para publicar só o site
(`npm run build` em `pageforge/`, saída `dist/`), mas o copiloto de IA ficaria fora —
seria preciso reescrever `server/copilot.mjs` como função serverless.

## Sobre os dados

O PageForge guarda projetos, leads e eventos no **localStorage do navegador**. Na imagem
de produção não há banco: cada visitante vê apenas os próprios dados. Para páginas
publicadas compartilháveis e leads centralizados é necessário um backend de dados.
