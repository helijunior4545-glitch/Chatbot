/* PAGEFORGE AI V26 — deterministic mock, validated operation contract, optional Base44 backend. */
export type AIBlock = {id:string;kind:string;title?:string;subtitle?:string;body?:string;description?:string;recipe?:string;[key:string]:unknown};
export type AIOperation =
 | {type:'update_block';blockId:string;changes:Record<string,string>}
 | {type:'add_block';kind:string;afterId?:string;changes:Record<string,string>}
 | {type:'move_block';blockId:string;direction:'up'|'down'};
export type AIRequest = {instruction:string;blocks:AIBlock[];selectedId:string};
export type AIResult = {operations:AIOperation[];summary:string;mode:'mock'|'base44'};
const TEXT_FIELDS=['title','subtitle','body','description','buttonText','eyebrow','ctaText','items'] as const;
const ALLOWED_KINDS=['hero','features','split','gallery','testimonials','cta','faq','stats','pricing','contact'] as const;
const allowed=new Set<string>(TEXT_FIELDS);
const kinds=new Set<string>(ALLOWED_KINDS);
const clean=(s:unknown,max=2400)=>String(s??'').trim().slice(0,max);
export function validateAIOperations(value:unknown,blocks:AIBlock[]):AIOperation[]{
 if(!Array.isArray(value)||value.length===0||value.length>8)throw new Error('Resposta IA: lista de operacoes invalida (1 a 8).');
 const ids=new Set(blocks.map(b=>b.id));
 return value.map((raw:unknown)=>{
  if(!raw||typeof raw!=='object')throw new Error('Operacao invalida.');
  const op=raw as Record<string,unknown>;
  if(op.type==='move_block'){
   if(typeof op.blockId!=='string'||!ids.has(op.blockId)||!['up','down'].includes(String(op.direction)))throw new Error('Movimento invalido.');
   return {type:'move_block',blockId:op.blockId,direction:op.direction as 'up'|'down'};
  }
  if(op.type!=='update_block'&&op.type!=='add_block')throw new Error('Tipo de operacao nao autorizado.');
  if(op.type==='update_block'&&(typeof op.blockId!=='string'||!ids.has(op.blockId)))throw new Error('Bloco inexistente.');
  if(op.type==='add_block'&&(typeof op.kind!=='string'||!kinds.has(op.kind)))throw new Error('Tipo de secao nao autorizado.');
  if(op.type==='add_block'&&op.afterId!==undefined&&(typeof op.afterId!=='string'||!ids.has(op.afterId)))throw new Error('Posicao invalida.');
  if(!op.changes||typeof op.changes!=='object'||Array.isArray(op.changes))throw new Error('Campos invalidos.');
  const changes:Record<string,string>={};
  for(const [key,val] of Object.entries(op.changes as Record<string,unknown>)){
   if(!allowed.has(key)||typeof val!=='string')throw new Error('Campo nao permitido: '+key);
   changes[key]=clean(val);
  }
  if(!Object.keys(changes).length)throw new Error('Nenhuma alteracao valida.');
  return op.type==='update_block'?{type:'update_block',blockId:op.blockId as string,changes}:
   {type:'add_block',kind:op.kind as string,afterId:op.afterId as string|undefined,changes};
 });
}
export function mockCopilot(req:AIRequest):AIResult{
 const instruction=clean(req.instruction,800);
 if(!instruction)throw new Error('Digite uma instrucao.');
 const lower=instruction.toLocaleLowerCase('pt-BR');
 const selected=req.blocks.find(b=>b.id===req.selectedId)||req.blocks[0];
 if(!selected)throw new Error('Pagina sem secoes.');
 let operations:AIOperation[]=[];
 let summary='Texto da secao atualizado';
 if(/(adicion|cri(e|ar)|nova|novo).*(se[cç][aã]o|benef[ií]cio|feature)/i.test(lower)||/(se[cç][aã]o|benef[ií]cio|feature).*(adicion|cri(e|ar))/i.test(lower)){
  operations=[{type:'add_block',kind:'features',afterId:selected.id,changes:{title:'Built for what comes next',subtitle:'Everything your team needs to move forward',body:'Fast workflows, seamless collaboration and measurable progress.'}}];
  summary='Nova secao de beneficios adicionada apos a selecionada';
 }else if(/(reorganiz|mover|subir|descer|move)/i.test(lower)){
  operations=[{type:'move_block',blockId:selected.id,direction:/descer|baixo|down/i.test(lower)?'down':'up'}];
  summary='Secao selecionada reposicionada';
 }else if(/rob[oô]tica|robot/i.test(lower)){
  operations=[{type:'update_block',blockId:selected.id,changes:{title:'Engineering the next generation of robotics',subtitle:'Intelligence that moves the world',body:'Connect autonomous systems, teams and innovation in one intelligent experience.'}}];
  summary='Conteudo adaptado para uma empresa de robotica';
 }else if(/(luxo|premium|elegan)/i.test(lower)){
  operations=[{type:'update_block',blockId:selected.id,changes:{title:'An exceptional experience, by design',subtitle:'Crafted for those who expect more',body:'Thoughtful details, seamless performance and a distinct visual identity.'}}];
  summary='Texto premium aplicado a secao';
 }else{
  operations=[{type:'update_block',blockId:selected.id,changes:{title:'A new vision, beautifully brought to life',subtitle:'Designed around your next big idea',body:'Bring your vision to life with a distinctive digital experience.'}}];
  summary='Nova proposta de texto aplicada a secao';
 }
 return {operations:validateAIOperations(operations,req.blocks),summary,mode:'mock'};
}
export async function requestCopilot(req:AIRequest,mode:'mock'|'base44'):Promise<AIResult>{
 if(mode==='mock')return mockCopilot(req);
 const endpoint=(import.meta.env.VITE_PAGEFORGE_AI_ENDPOINT||'').trim();
 if(!endpoint)throw new Error('Base44 nao configurado. Defina VITE_PAGEFORGE_AI_ENDPOINT e um endpoint autenticado.');
 const url=new URL(endpoint,window.location.origin);
 if(url.protocol!=='https:'&&url.hostname!=='localhost'&&url.hostname!=='127.0.0.1')throw new Error('Endpoint deve usar HTTPS.');
 const response=await fetch(url.toString(),{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(req)});
 if(!response.ok)throw new Error('Backend Base44 retornou HTTP '+response.status);
 const data:unknown=await response.json();
 if(!data||typeof data!=='object')throw new Error('Resposta Base44 invalida.');
 const result=data as Record<string,unknown>;
 return {operations:validateAIOperations(result.operations,req.blocks),summary:clean(result.summary||'Alteracoes geradas',160),mode:'base44'};
}
