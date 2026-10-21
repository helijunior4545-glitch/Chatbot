/** PageForge V26 — copiloto de IA como funcao backend Base44 (`pageforgeCopilot`).
 * Chame via SDK no app: `base44.functions.invoke('pageforgeCopilot', {instruction,blocks,selectedId})`.
 * Entrada:  {instruction:string, blocks:Array<{id,kind,...}>, selectedId:string}
 * Saida:    {operations:[{type:'update_block'|'add_block'|'move_block',...}], summary:string}
 * A IA roda no servidor (invokeLLM do app): nenhuma chave privada chega ao navegador.
 * Todo texto do modelo passa pelo mesmo allow-list de campos/tipos validado no cliente;
 * HTML/JS arbitrario nunca e aceito.
 */
import {createClientFromRequest} from 'npm:@base44/sdk';

export const CONTRACT = {
  request: ['instruction','blocks','selectedId'],
  response: ['operations','summary'],
  allowedTypes: ['update_block','add_block','move_block'],
  allowedFields: ['title','subtitle','body','description','buttonText','eyebrow','ctaText','items'],
};

const ALLOWED_FIELDS = CONTRACT.allowedFields;
const ALLOWED_KINDS = ['hero','features','split','gallery','testimonials','cta','faq','stats','pricing','contact'];
const MAX_OPERATIONS = 8;
const MAX_BLOCKS = 40;
const MAX_INSTRUCTION = 800;
const MAX_FIELD_TEXT = 2400;

type Operation =
  | {type:'update_block';blockId:string;changes:Record<string,string>}
  | {type:'add_block';kind:string;afterId?:string;changes:Record<string,string>}
  | {type:'move_block';blockId:string;direction:'up'|'down'};

const RESPONSE_SCHEMA = {
  type:'object',
  properties:{
    operations:{
      type:'array',
      maxItems:MAX_OPERATIONS,
      items:{
        type:'object',
        properties:{
          type:{type:'string',enum:CONTRACT.allowedTypes},
          blockId:{type:'string'},
          afterId:{type:'string'},
          direction:{type:'string',enum:['up','down']},
          kind:{type:'string',enum:ALLOWED_KINDS},
          changes:{type:'object',additionalProperties:{type:'string'}},
        },
        required:['type'],
      },
    },
    summary:{type:'string'},
  },
  required:['operations','summary'],
};

const clean = (value:unknown,max=MAX_FIELD_TEXT)=>String(value??'').trim().slice(0,max);

function readBlocks(value:unknown):{id:string;kind:string}[]{
  if(!Array.isArray(value))throw new Error('blocks deve ser uma lista de secoes.');
  if(value.length>MAX_BLOCKS)throw new Error('Pagina com secoes demais para o copiloto.');
  return value.map((raw)=>{
    const block=raw as Record<string,unknown>;
    if(!block||typeof block.id!=='string'||typeof block.kind!=='string')throw new Error('Secao invalida no payload.');
    return {
      id:block.id,
      kind:block.kind,
      title:clean(block.title,400),
      subtitle:clean(block.subtitle,400),
      body:clean(block.body,600),
    };
  });
}

function validateOperations(value:unknown,blocks:{id:string}[]):Operation[]{
  if(!Array.isArray(value)||value.length===0||value.length>MAX_OPERATIONS)throw new Error('Resposta IA: lista de operacoes invalida (1 a 8).');
  const ids=new Set(blocks.map(block=>block.id));
  const fields=new Set<string>(ALLOWED_FIELDS);
  const kinds=new Set<string>(ALLOWED_KINDS);
  return value.map((raw)=>{
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
      if(!fields.has(key)||typeof val!=='string')throw new Error('Campo nao permitido: '+key);
      changes[key]=clean(val);
    }
    if(!Object.keys(changes).length)throw new Error('Nenhuma alteracao valida.');
    return op.type==='update_block'
      ? {type:'update_block' as const,blockId:op.blockId as string,changes}
      : {type:'add_block' as const,kind:op.kind as string,afterId:op.afterId as string|undefined,changes};
  });
}

function buildPrompt(instruction:string,blocks:{id:string;kind:string}[],selectedId:string){
  return [
    'Voce e o copiloto de design do PageForge. Edite a estrutura de uma landing page em ingles.',
    'Instrucao do usuario: "'+instruction+'"',
    'Secao selecionada: '+(selectedId||'nenhuma'),
    'Estrutura atual da pagina (JSON): '+JSON.stringify(blocks),
    'Responda somente com JSON no contrato pedido.',
    'Regras: 1 a '+MAX_OPERATIONS+' operacoes; tipos '+CONTRACT.allowedTypes.join('/')+'.',
    'add_block exige kind em '+ALLOWED_KINDS.join('/')+' e pode usar afterId de uma secao existente.',
    'changes aceita apenas '+ALLOWED_FIELDS.join(', ')+' com texto puro (sem HTML, sem scripts).',
    'Escreva textos curtos e prontos para publicacao.',
  ].join('\n');
}

Deno.serve(async(req)=>{
  if(req.method!=='POST')return Response.json({error:'Metodo nao permitido.'},{status:405});
  try{
    /* createClientFromRequest da acesso as integracoes Core do app (IA) com o contexto da chamada. */
    const base44=createClientFromRequest(req);
    const body=await req.json();
    const instruction=clean(body?.instruction,MAX_INSTRUCTION);
    if(!instruction)throw new Error('Digite uma instrucao.');
    const blocks=readBlocks(body?.blocks);
    const selectedId=typeof body?.selectedId==='string'?body.selectedId:'';
    const raw=await base44.integrations.Core.InvokeLLM({
      prompt:buildPrompt(instruction,blocks,selectedId),
      response_json_schema:RESPONSE_SCHEMA,
    });
    const parsed=(typeof raw==='string'?JSON.parse(raw):raw) as Record<string,unknown>;
    if(!parsed||typeof parsed!=='object')throw new Error('Resposta IA invalida.');
    return Response.json({
      operations:validateOperations(parsed.operations,blocks),
      summary:clean(parsed.summary,160)||'Alteracoes geradas',
    });
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:'Falha ao gerar a proposta.'},{status:400});
  }
});
