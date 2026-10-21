import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// O copiloto de IA roda em um serviço local (server/copilot.mjs). O dev server
// encaminha /api para ele, mantendo a aplicação em uma única origem.
const aiApiTarget = process.env.AI_PROXY_TARGET || 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: aiApiTarget, changeOrigin: true } },
  },
  test: { environment: 'node' },
});
