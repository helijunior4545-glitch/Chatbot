/**
 * Servidor de produção do PageForge: entrega o build do Vite (`dist/`) com
 * fallback do SPA e encaminha /api/* e /healthz para o copiloto de IA.
 * Tudo na mesma porta (`PORT`), para rodar em qualquer provedor de container.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { createCopilotHandler } from './copilot.mjs';

const PORT = Number(process.env.PORT || 3000);
const DIST = resolve(process.env.STATIC_DIR || 'dist');
const copilot = createCopilotHandler();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function sendFile(res, filePath) {
  return new Promise((done) => {
    const cache = filePath.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache';
    stat(filePath).then((info) => {
      res.writeHead(200, {
        'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': cache,
      });
      createReadStream(filePath).pipe(res).on('finish', done).on('error', done);
    }).catch(() => {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      done();
    });
  });
}

async function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method not allowed');
  }
  const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  const candidate = resolve(join(DIST, normalize(pathname)));
  if (candidate !== DIST && !candidate.startsWith(DIST + sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }
  try {
    const info = await stat(candidate);
    if (info.isFile()) return sendFile(res, candidate);
  } catch {
    /* rota do SPA: entrega o index */
  }
  return sendFile(res, join(DIST, 'index.html'));
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url || '/', 'http://localhost');
  if (pathname === '/healthz' || pathname.startsWith('/api/')) return copilot(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[pageforge] serving ${DIST} on :${PORT}`);
});
