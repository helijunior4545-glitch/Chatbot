# PageForge AI Copilot V26 — conexao com a API Base44

## O que esta pronto
- Painel de IA dentro do inspetor do editor, sem modificar outros temas.
- MOCK deterministico: reescrever hero (robotica/premium), criar secao de beneficios e mover secao.
- Caminho completo: prompt -> geracao -> validacao de JSON -> preview de operacoes -> confirmar -> historico/Undo -> salvar/publicar.
- Modo `Base44 (real)`: chama a funcao backend `pageforgeCopilot` do proprio app pelo SDK
  (`base44.functions.invoke`). A IA roda no servidor Base44 — nenhuma chave privada no navegador
  e nenhuma variavel de ambiente obrigatoria.

## Teste sem API (local)
1. `npm run dev`; abra um projeto no editor.
2. No painel "AI Design Copilot", selecione `Mock (sem API)`.
3. Digite `Transforme esta hero em uma empresa de robotica` e clique `Generating.../Generate proposal`.
4. Veja a previa JSON, aplique e teste `Undo`.
5. Digite `Crie uma secao de beneficios` e repita.
6. Digite `Mova a secao para cima` e repita.
7. Salve, abra Preview e confira o resultado.

## Base44 real
- A funcao esta em `base44/functions/pageforgeCopilot.ts` e e publicada junto com o app.
  Contrato: `POST {instruction,blocks,selectedId}` -> `{operations,summary}`.
- Contrato de operacoes e campos permitidos: veja `CONTRACT` no arquivo da funcao e o mesmo
  allow-list em `src/lib/pageforge-ai.ts`. Nunca execute HTML/JS arbitrario.
- O cliente resolve o app id nesta ordem: `VITE_BASE44_APP_ID` (build/dev) e, se vazio, o
  `data-app-id` que a plataforma Base44 injeta em toda pagina publicada. O app id e publico.
- Chamada anonima: o login do PageForge e uma simulacao local (personas de demonstracao), entao
  a funcao precisa aceitar chamadas sem sessao Base44. Ela valida payload/tamanho e limita a
  8 operacoes; antes de expor a usuarios reais, considere rate limit e um identificador de
  workspace por chamada.
- `VITE_PAGEFORGE_AI_ENDPOINT` continua opcional: se preenchido, o painel posta nesse endpoint
  proprio (auto-hospedado) em vez de chamar a funcao Base44. Reinicie o Vite ao altera-lo.
  **Nao exponha tokens privados em VITE_**.

## Verificacoes
- `npm run check` (`tsc --noEmit`), `npm test` (vitest) e `npm run build`.
- No app publicado: escolher `Base44 (real)`, gerar e aplicar a proposta (a funcao precisa estar
  publicada; sem ela a API responde `Function not found`).
