# PageForge AI Copilot V26 — instalacao e conexao Base44

## O que esta pronto
- Painel de IA dentro do inspetor do editor, sem modificar outros temas.
- MOCK deterministico: reescrever hero (robotica/premium), criar secao de beneficios e mover secao.
- Caminho completo: prompt -> geracao -> validacao de JSON -> preview de operacoes -> confirmar -> historico/Undo -> salvar/publicar.
- Modo Base44: contrato HTTP configuravel; **nao** e uma IA real ate configurar o backend autenticado.

## Teste sem API
1. `npm run dev`; abra um projeto no editor.
2. No painel "AI Design Copilot", selecione `Mock (sem API)`.
3. Digite `Transforme esta hero em uma empresa de robotica` e clique `Gerar proposta`.
4. Veja a previa JSON, clique `Aplicar alteracoes` e teste `Undo`.
5. Digite `Crie uma secao de beneficios` e repita.
6. Digite `Mova a secao para cima` e repita.
7. Salve, abra Preview e confira o resultado.

## Base44 real
- Crie uma Backend Function `pageforgeCopilot` no seu app Base44.
- Configure um modelo/integração de IA no backend (chave e autenticacao **apenas no servidor**).
- Implemente o contrato `POST` com body `{instruction,blocks,selectedId}` e resposta `{operations,summary}`.
- Use a mesma lista de tipos e campos de `src/lib/pageforge-ai.ts`. Nunca execute HTML/JS arbitrario.
- Configure `VITE_PAGEFORGE_AI_ENDPOINT=https://SEU-ENDPOINT-AUTENTICADO` no ambiente Vite.
- Verifique CORS, cookies/sessao, autorizacao de workspace, rate limit e limite de tamanho no backend.
- Reinicie Vite e escolha `Base44 (real)` no painel. **Nao exponha tokens privados em VITE_**.

`base44/functions/pageforgeCopilot.ts` e um esqueleto de contrato para adaptar a versao do runtime Base44 da sua conta. Nao e implantado automaticamente.

## Verificacoes
`python3 py.py --dry-run`, `python3 py.py` (executa `npm run build`).
A instalacao nao executa chamadas pagas de IA nem confirma elegibilidade no hackathon.
