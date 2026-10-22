/** PageForge — Base44 hosted backend function (Deno).
 * Requires Base44 Backend Functions and Core.InvokeLLM availability.
 * Uses the authenticated request; no API key in the browser.
 * Important: local account/workspace IDs are not Base44 authorization.
 * Until real tenant ownership is checked server-side, this function is
 * limited to generating text proposals from sanitized blocks; it cannot
 * access private entities, publish, or persist sites.
 */
import { createClientFromRequest } from 'npm:@base44/sdk';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const allowed=new Set(['hero','features','about','services','testimonials','cta','faq','contact','pricing','gallery','footer','text','stats']);
const fields=new Set(['title','subtitle','body','description','buttonText','eyebrow','ctaText']);
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const isObj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);

Deno.serve(async(req:Request)=>{
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  try {
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user?.id)return json({error:'Authentication required'},401);
    const size=Number(req.headers.get('content-length')||0);
    if(size>40000)return json({error:'Payload too large'},413);
    const input=await req.json();
    if(!isObj(input))return json({error:'Invalid request'},400);
    const instruction=str(input.instruction,1200);
    const selectedId=str(input.selectedId,120);
    if(instruction.length<3)return json({error:'Instruction too short'},400);
    if(!Array.isArray(input.blocks)||input.blocks.length>80)return json({error:'Invalid blocks'},400);
    const blocks=input.blocks.map((b:unknown)=>{
      if(!isObj(b))return null;
      const id=str(b.id,120),kind=str(b.kind,50);
      if(!id||!kind)return null;
      const result:Record<string,unknown>={id,kind:allowed.has(kind)?kind:'other'};
      for(const key of fields)if(typeof b[key]==='string')result[key]=str(b[key],500);
      return result;
    }).filter(Boolean);
    if(blocks.length!==input.blocks.length)return json({error:'Invalid block entries'},400);
    const prompt=`You are the PageForge website editor copilot. Return ONLY a JSON object with {"summary":string,"operations":array}.\nAllowed operations: {"type":"update_block","blockId":existing id,"changes":{field:string}}. Only update existing blocks. Allowed fields: ${[...fields].join(', ')}. No HTML, JS, URLs, markdown code fences, or extra keys. Max 8 operations, max 6 fields each. Respect the instruction, write clear website copy.\nInstruction: ${instruction}\nSelected block: ${selectedId}\nBlocks: ${JSON.stringify(blocks)}`;
    // Base44 Core integration: verify availability in your app before publishing.
    const result=await base44.integrations.Core.InvokeLLM({prompt,response_json_schema:{type:'object',properties:{summary:{type:'string'},operations:{type:'array',items:{type:'object',properties:{type:{type:'string'},blockId:{type:'string'},changes:{type:'object'}},required:['type','blockId','changes']}}},required:['summary','operations']}});
    const data=typeof result==='string'?JSON.parse(result):result;
    if(!isObj(data)||!Array.isArray(data.operations))return json({error:'Invalid AI response'},502);
    const ids=new Set(blocks.map((b:any)=>b.id));
    const operations=[];
    for(const op of data.operations.slice(0,8)){
      if(!isObj(op)||op.type!=='update_block'||typeof op.blockId!=='string'||!ids.has(op.blockId)||!isObj(op.changes))continue;
      const changes:Record<string,string>={};
      for(const [key,value] of Object.entries(op.changes))if(fields.has(key)&&typeof value==='string')changes[key]=value.slice(0,1200);
      if(Object.keys(changes).length)operations.push({type:'update_block',blockId:op.blockId,changes});
    }
    return json({summary:str(data.summary,160)||'Proposta gerada',operations});
  }catch(error){
    console.error('pageforgeCopilot error',error instanceof Error?error.message:'unknown');
    return json({error:'Could not generate proposal. Check Base44 authentication and AI integration.'},500);
  }
});
