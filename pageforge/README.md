# PageForge Studio — blueprint autocontido

## Executar

```bash
npm install
cp .env.example .env
npm run dev
npm run test
npm run build
```

O modo local é **uma simulação para desenvolvimento**; seus usuários são personas de teste, não autenticação de produção. Dados são persistidos no localStorage do navegador. Não use esse modo em produção nem para dados reais de clientes.

## Base44

O projeto inclui um adaptador experimental em `src/integrations/base44.ts`. Configure `VITE_DATA_PROVIDER=base44` e `VITE_BASE44_APP_ID` somente depois de confirmar o contrato atual do SDK e provisionar as entidades `PFWorkspace`, `PFSite`, `PFLead`, `PFEvent`. Não é possível afirmar compatibilidade de importação, publicação pública ou regras de segurança sem testes na plataforma.

**Crítico:** as verificações de workspace feitas no cliente são apenas UX. No Base44, configure e teste regras de acesso de leitura/escrita no servidor, especialmente em PFLead, PFWorkspace e PFSite. Publicação pública deve expor exclusivamente um snapshot aprovado, nunca os rascunhos ou leads.

## Funcionalidades

- Editor visual de blocos com ordenação drag-and-drop, duplicação, exclusão e edição de propriedades.
- Estilos por seção e globais, imagens por URL ou upload local (data URL para testes).
- Desfazer/refazer, rascunho, publicação de snapshot, versão publicada, pré-visualização desktop/mobile.
- Workspaces de teste e isolamento por usuário simulado; páginas públicas em `/p/:slug`.
- Leads e analytics locais por workspace.
- Templates de partida, exportação/importação JSON e download HTML estático.
- Testes de utilitários e checagem TypeScript.

## Limitações atuais

- A captura de leads, analytics e publicação são simuladas localmente; não são serviços de produção.
- A exportação HTML é uma página estática, não o projeto React nem um deploy Base44.
- O adaptador Base44 é um ponto de integração, não um certificado de compatibilidade.
- O editor não executa JavaScript arbitrário inserido pelo usuário.
