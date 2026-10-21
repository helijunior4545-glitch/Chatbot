/**
 * PageForge AI copilot — servidor mínimo, sem dependências.
 *
 * O editor (SPA) chama POST /api/copilot. Em desenvolvimento o Vite faz proxy
 * dessa rota para este serviço, que fala com um provedor compatível com a API
 * OpenAI (OpenAI, OpenRouter, Groq, ...) e devolve as operações validadas que o
 * editor já sabe aplicar.
 *
 * Variáveis de ambiente:
 *   AI_API_KEY  (obrigatória) chave do provedor — nunca vai para o repositório
 *   AI_BASE_URL (https://api.openai.com/v1 por padrão)
 *   AI_MODEL    (gpt-4o-mini por padrão)
 *   PORT        (8787 por padrão)
 */
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = (process.env.AI_API_KEY || '').trim();
const BASE_URL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const MODEL = (process.env.AI_MODEL || 'gpt-4o-mini').trim();

const TEXT_FIELDS = ['title', 'subtitle', 'body', 'description', 'buttonText', 'eyebrow', 'ctaText'];
const ALLOWED_KINDS = ['hero', 'features', 'split', 'gallery', 'testimonials', 'cta', 'faq', 'stats', 'pricing', 'contact'];
const MAX_BODY = 96 * 1024;
const WINDOW_MS = 60_000;
const MAX_CALLS_PER_WINDOW = 30;

const SYSTEM_PROMPT = [
  'Você é o AI Design Copilot do PageForge, um editor visual de landing pages.',
  'Responda SOMENTE com JSON válido, sem markdown, no formato:',
  '{"summary":"resumo curto em português","operations":[ ... ]}',
  'Cada operação é uma das formas:',
  '{"type":"update_block","blockId":"<id existente>","changes":{"title":"...","subtitle":"...","body":"..."}}',
  '{"type":"add_block","kind":"<hero|features|split|gallery|testimonials|cta|faq|stats|pricing|contact>","afterId":"<id existente>","changes":{...}}',
  '{"type":"move_block","blockId":"<id existente>","direction":"up"}',
  'Regras:',
  '- use apenas ids de blocos presentes no payload;',
  '- no máximo 8 operações;',
  '- em changes só são permitidos: title, subtitle, body, description, buttonText, eyebrow, ctaText;',
  '- textos curtos, concretos, sem HTML, CSS, markdown ou URLs de imagem;',
  '- escreva no mesmo idioma da instrução do usuário.',
].join('\n');

const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_CALLS_PER_WINDOW;
}

const clean = (value, max = 1200) => String(value ?? '').trim().slice(0, max);

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) throw new Error('Payload sem seções.');
  return blocks.slice(0, 40).map((block) => {
    const b = block && typeof block === 'object' ? block : {};
    return {
      id: clean(b.id, 80),
      kind: clean(b.kind, 40),
      title: clean(b.title, 400),
      subtitle: clean(b.subtitle, 400),
      body: clean(b.body, 800),
      description: clean(b.description, 400),
      buttonText: clean(b.buttonText, 80),
    };
  }).filter((b) => b.id);
}

function validateOperations(value, blockIds) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) {
    throw new Error('A IA devolveu uma lista de operações inválida (1 a 8).');
  }
  return value.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('A IA devolveu uma operação inválida.');
    const op = raw;
    if (op.type === 'move_block') {
      if (typeof op.blockId !== 'string' || !blockIds.has(op.blockId)) throw new Error('A IA tentou mover uma seção inexistente.');
      if (op.direction !== 'up' && op.direction !== 'down') throw new Error('A IA devolveu um movimento inválido.');
      return { type: 'move_block', blockId: op.blockId, direction: op.direction };
    }
    if (op.type !== 'update_block' && op.type !== 'add_block') throw new Error('Tipo de operação não autorizado.');
    if (op.type === 'update_block' && (typeof op.blockId !== 'string' || !blockIds.has(op.blockId))) throw new Error('A IA apontou para uma seção inexistente.');
    if (op.type === 'add_block' && !ALLOWED_KINDS.includes(op.kind)) throw new Error('Tipo de seção não autorizado.');
    if (op.type === 'add_block' && op.afterId !== undefined && !blockIds.has(op.afterId)) throw new Error('Posição inválida para a nova seção.');
    if (!op.changes || typeof op.changes !== 'object' || Array.isArray(op.changes)) throw new Error('A IA devolveu campos inválidos.');
    const changes = {};
    for (const [key, val] of Object.entries(op.changes)) {
      if (!TEXT_FIELDS.includes(key)) throw new Error('Campo não permitido: ' + key);
      if (typeof val !== 'string') throw new Error('Campo com valor inválido: ' + key);
      changes[key] = clean(val);
    }
    if (!Object.keys(changes).length) throw new Error('A IA não devolveu nenhuma alteração válida.');
    return op.type === 'update_block'
      ? { type: 'update_block', blockId: op.blockId, changes }
      : { type: 'add_block', kind: op.kind, ...(op.afterId ? { afterId: op.afterId } : {}), changes };
  });
}

function parseJsonAnswer(text) {
  const raw = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('A IA não devolveu JSON.');
    return JSON.parse(raw.slice(start, end + 1));
  }
}

async function askProvider(payload) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            instruction: payload.instruction,
            selectedId: payload.selectedId,
            blocks: payload.blocks,
          }),
        },
      ],
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    let detail = body.slice(0, 300);
    try {
      const parsed = JSON.parse(body);
      detail = parsed?.error?.message || parsed?.message || detail;
    } catch {
      /* provedor devolveu texto puro */
    }
    // 5xx aqui é mascarado pelo proxy de preview (ele assume "app fora do ar"),
    // então repassamos a falha do provedor como 4xx com a mensagem original.
    const status = response.status === 429 ? 429 : 422;
    throw Object.assign(new Error(`Provedor de IA retornou HTTP ${response.status}: ${detail}`), { status });
  }
  const data = JSON.parse(body);
  const answer = data?.choices?.[0]?.message?.content;
  if (!answer) throw Object.assign(new Error('Provedor de IA devolveu uma resposta vazia.'), { status: 422 });
  return parseJsonAnswer(answer);
}

async function runCopilot(payload) {
  if (typeof payload?.instruction !== 'string' || !payload.instruction.trim()) throw new Error('Digite uma instrução.');
  const blocks = sanitizeBlocks(payload.blocks);
  const blockIds = new Set(blocks.map((b) => b.id));
  const selectedId = typeof payload.selectedId === 'string' && blockIds.has(payload.selectedId) ? payload.selectedId : blocks[0].id;
  const answer = await askProvider({
    instruction: clean(payload.instruction, 1200),
    selectedId,
    blocks,
  });
  return {
    operations: validateOperations(answer?.operations, blockIds),
    summary: clean(answer?.summary || 'Alterações geradas', 160),
    mode: 'base44',
  };
}

function send(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(text) });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Payload muito grande.'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(Object.assign(new Error('JSON inválido.'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

/** Request listener do copiloto (usado pelo servidor de dev e pelo de produção). */
export function createCopilotHandler() {
  return async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/healthz') {
    return send(res, 200, { ok: true, configured: Boolean(API_KEY), model: MODEL });
  }

  if (url.pathname !== '/api/copilot') {
    return send(res, 404, { error: 'Rota não encontrada.' });
  }
  if (req.method !== 'POST') {
    return send(res, 405, { error: 'Use POST.' });
  }
  const ip = req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return send(res, 429, { error: 'Muitas solicitações. Aguarde um minuto.' });
  }
  if (!API_KEY) {
    return send(res, 503, { error: 'IA não configurada: falta a credencial AI_API_KEY neste ambiente.' });
  }

  try {
    const payload = await readBody(req);
    const result = await runCopilot(payload);
    return send(res, 200, result);
  } catch (error) {
    const status = Number(error?.status) || 400;
    console.error('[copilot]', status, error?.message || error);
    return send(res, status, { error: error?.message || 'Falha ao gerar a proposta.' });
  }
  };
}

export function startCopilotServer(port = PORT) {
  const server = createServer(createCopilotHandler());
  server.listen(port, '0.0.0.0', () => {
    console.log(`[copilot] listening on :${port} (model=${MODEL}, configured=${Boolean(API_KEY)})`);
  });
  return server;
}

// Executado diretamente (`node server/copilot.mjs`), inclusive pelo compose de dev.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startCopilotServer();
}
