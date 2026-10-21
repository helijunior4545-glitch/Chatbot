import {useEffect,useMemo,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {arrayMove} from '@dnd-kit/sortable';
import {Settings2} from 'lucide-react';
import type {PremiumTemplate} from '../lib/templates';
import type {Actor,Block,Site} from '../lib/types';
import {makeBlock,snapshot} from '../lib/factory';
import {readStore,saveSite} from '../lib/local';
import {downloadFile,exportStaticHtml} from '../lib/export';
import {isRemoteCopilotConfigured,requestCopilot,validateAIOperations,type AIResult} from '../lib/pageforge-ai';
import {Renderer} from './Renderer';
import {EditorToolbar} from './editor/EditorToolbar';
import {BlocksPanel} from './editor/BlocksPanel';
import {ThemePanel} from './editor/ThemePanel';
import {SiteSettingsPanel} from './editor/SiteSettingsPanel';
import {AICopilotPanel} from './editor/AICopilotPanel';
import {BlockInspector} from './editor/BlockInspector';
import type {AICopilotMode,EditorDevice,EditorTab,MobilePanel} from './editor/types';
import '../styles/pages/pageforge-ai-v26.css';

/** Editor shell: owns the site draft, undo history and AI proposal state,
 * and composes the toolbar, side panels, canvas and inspector. */
export function Editor({actor}:{actor:Actor}){
 const {id}=useParams();
 const navigate=useNavigate();
 const original=useMemo(()=>{
  const s=readStore();
  const found=s.sites.find(x=>x.id===id);
  return found&&s.workspaces.some(w=>w.id===found.workspaceId&&w.ownerId===actor.id)?found:null;
 },[actor.id,id]);
 const [site,setSite]=useState<Site|null>(original?structuredClone(original):null);
 const [selectedId,setSelectedId]=useState(original?.blocks[0]?.id||'');
 const [tab,setTab]=useState<EditorTab>('blocks');
 const [device,setDevice]=useState<EditorDevice>('desktop');
 const [pfPanel,setPfPanel]=useState<MobilePanel>('preview');
 const [activeField,setActiveField]=useState<string>('');
 const [history,setHistory]=useState<Site[]>([]);
 const [future,setFuture]=useState<Site[]>([]);
 const [dirty,setDirty]=useState(false);
 const [aiPrompt,setAiPrompt]=useState('Transforme esta hero em uma empresa de robotica');
 const [aiMode,setAiMode]=useState<AICopilotMode>(isRemoteCopilotConfigured()?'base44':'mock');
 const [aiBusy,setAiBusy]=useState(false);
 const [aiError,setAiError]=useState('');
 const [aiProposal,setAiProposal]=useState<AIResult|null>(null);
 const [chosenTemplate,setChosenTemplate]=useState<PremiumTemplate>('technology');

 useEffect(()=>{
  const listener=(e:KeyboardEvent)=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();document.getElementById('pf-save')?.click();}
  };
  window.addEventListener('keydown',listener);
  return()=>window.removeEventListener('keydown',listener);
 },[]);

 if(!site)return <main className="empty"><h2>Page not found or access denied</h2><Link to="/dashboard">Back</Link></main>;
 const selected=site.blocks.find(b=>b.id===selectedId);

 const apply=(fn:(s:Site)=>Site)=>{
  setHistory(h=>[...h.slice(-49),structuredClone(site)]);
  setFuture([]);
  setSite(fn(structuredClone(site)));
  setDirty(true);
 };
 const patch=(updates:Partial<Block>)=>apply(s=>({...s,blocks:s.blocks.map(b=>b.id===selectedId?{...b,...updates}:b)}));
 const addBlock=(kind:Block['kind'])=>{
  const block=makeBlock(kind);
  apply(s=>({...s,blocks:[...s.blocks,block]}));
  setSelectedId(block.id);
 };
 const selectBlock=(blockId:string)=>{
  setSelectedId(blockId);
  if(window.matchMedia('(max-width:1023px)').matches)setPfPanel('design');
 };
 const selectFromCanvas=(e:React.MouseEvent<HTMLElement>)=>{
  const target=e.target as HTMLElement;
  const block=target.closest<HTMLElement>('[data-pf-block]');
  if(!block||target.closest('[data-pf-canvas-control]'))return;
  e.preventDefault();
  e.stopPropagation();
  const blockId=block.dataset.pfBlock||'';
  const field=target.closest<HTMLElement>('[data-pf-field]')?.dataset.pfField||'';
  setSelectedId(blockId);
  setActiveField(field);
  setTab('blocks');
  window.requestAnimationFrame(()=>{
   const panel=document.querySelector<HTMLElement>('.inspector');
   const fieldInput=field?panel?.querySelector<HTMLElement>(`[data-pf-config="${field}"]`):null;
   const focusTarget=fieldInput?.querySelector<HTMLElement>('input,textarea,select')||fieldInput;
   focusTarget?.scrollIntoView({block:'nearest',behavior:'smooth'});
   focusTarget?.classList.add('pf7-field-target');
   window.setTimeout(()=>focusTarget?.classList.remove('pf7-field-target'),1600);
  });
 };
 const aiGenerate=async()=>{
  setAiBusy(true);
  setAiError('');
  setAiProposal(null);
  try{
   const result=await requestCopilot({instruction:aiPrompt,selectedId,blocks:site.blocks},aiMode);
   setAiProposal(result);
  }catch(e){
   setAiError(e instanceof Error?e.message:String(e));
  }finally{
   setAiBusy(false);
  }
 };
 const aiApply=()=>{
  if(!aiProposal)return;
  try{
   const ops=validateAIOperations(aiProposal.operations,site.blocks);
   let firstAdded='';
   apply(s=>{
    let blocks=[...s.blocks];
    for(const op of ops){
     if(op.type==='update_block'){blocks=blocks.map(b=>b.id===op.blockId?{...b,...op.changes}:b);}
     else if(op.type==='add_block'){
      const block={...makeBlock(op.kind as Block['kind']),...op.changes};
      const index=blocks.findIndex(x=>x.id===op.afterId);
      blocks.splice(index<0?blocks.length:index+1,0,block);
      if(!firstAdded)firstAdded=block.id;
     }else if(op.type==='move_block'){
      const index=blocks.findIndex(b=>b.id===op.blockId);
      const to=index+(op.direction==='up'?-1:1);
      if(index>=0&&to>=0&&to<blocks.length){
       const [moved]=blocks.splice(index,1);
       blocks.splice(to,0,moved);
      }
     }
    }
    return {...s,blocks};
   });
   if(firstAdded)setSelectedId(firstAdded);
   setAiProposal(null);
   setAiError('Alteracoes aplicadas. Use Undo para desfazer.');
  }catch(e){
   setAiError(e instanceof Error?e.message:String(e));
  }
 };
 const save=(publish=false)=>{
  try{
   const updated:Site={...site,version:site.version+(publish?1:0),published:publish||site.published,publishedSnapshot:publish?null:site.publishedSnapshot};
   if(publish)updated.publishedSnapshot=snapshot(updated);
   const saved=saveSite(actor,updated);
   localStorage.removeItem(`pageforge-preview-${site.id}`);
   setSite(saved);
   setDirty(false);
   alert(publish?'Page published!':'Draft saved!');
  }catch(e){
   alert(String(e));
  }
 };
 const undo=()=>{
  if(!history.length)return;
  setFuture(f=>[site,...f]);
  setSite(history.at(-1)!);
  setHistory(h=>h.slice(0,-1));
  setDirty(true);
 };
 const redo=()=>{
  if(!future.length)return;
  setHistory(h=>[...h,site]);
  setSite(future[0]);
  setFuture(f=>f.slice(1));
  setDirty(true);
 };
 const moveCanvasBlock=(blockId:string,direction:-1|1)=>{
  const visible=site.blocks.filter(b=>b.enabled);
  const current=visible.findIndex(b=>b.id===blockId);
  const neighbor=visible[current+direction];
  if(!neighbor)return;
  const index=site.blocks.findIndex(b=>b.id===blockId);
  const next=site.blocks.findIndex(b=>b.id===neighbor.id);
  apply(s=>({...s,blocks:arrayMove(s.blocks,index,next)}));
  setSelectedId(blockId);
  setActiveField('');
 };
 const upload=(file:File)=>{
  if(file.size>2_000_000){alert('In local mode, images must be no larger than 2 MB.');return;}
  const reader=new FileReader();
  reader.onload=()=>patch({image:String(reader.result)});
  reader.readAsDataURL(file);
 };
 const exportJson=()=>downloadFile(`${site.slug}.json`,JSON.stringify(site,null,2),'application/json');
 const exportHtml=()=>downloadFile(`${site.slug}.html`,exportStaticHtml(site),'text/html');
 const openPreview=()=>{
  localStorage.setItem(`pageforge-preview-${site.id}`,JSON.stringify({actorId:actor.id,expires:Date.now()+30*60*1000,site}));
  window.open(`/preview/${site.id}`,"_blank","noopener,noreferrer");
 };

 return <div className="editor">
  <EditorToolbar site={site} dirty={dirty} canUndo={!!history.length} canRedo={!!future.length} device={device} onDevice={setDevice} onUndo={undo} onRedo={redo} onSave={()=>save()} onPublish={()=>save(true)} onExportJson={exportJson} onExportHtml={exportHtml} onOpenPreview={openPreview}/>
  <div className="editor-body" data-pf-panel={pfPanel}>
   <div className="pf-editor-mobile-tabs" role="group" aria-label="Editor panels"><button type="button" aria-pressed={pfPanel==='preview'} onClick={()=>setPfPanel('preview')}>Preview</button><button type="button" aria-pressed={pfPanel==='blocks'} onClick={()=>setPfPanel('blocks')}>Sections</button><button type="button" aria-pressed={pfPanel==='design'} onClick={()=>setPfPanel('design')}>Design & AI</button></div>
   <aside className="editor-sidebar">
    <div className="editor-tabs"><button className={tab==='blocks'?'active':''} onClick={()=>setTab('blocks')}>Blocks</button><button className={tab==='theme'?'active':''} onClick={()=>setTab('theme')}>Style</button><button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}>Site</button></div>
    {tab==='blocks'&&<BlocksPanel site={site} selectedId={selectedId} apply={apply} onSelectBlock={selectBlock} onAddBlock={addBlock}/>}
    {tab==='theme'&&<ThemePanel site={site} apply={apply} chosenTemplate={chosenTemplate} onChooseTemplate={setChosenTemplate}/>}
    {tab==='settings'&&<SiteSettingsPanel site={site} apply={apply} onBack={()=>navigate('/dashboard')}/>}
   </aside>
   <main className="editor-stage" onClickCapture={selectFromCanvas} aria-label="Visual editor: click text, images, and blocks to configure them">
    <div className={`canvas-frame ${device}`}><Renderer blocks={site.blocks} theme={site.theme} editorMode selectedBlockId={selectedId} onMoveBlock={moveCanvasBlock}/></div>
   </main>
   <aside className="inspector">
    <AICopilotPanel mode={aiMode} onModeChange={mode=>{setAiMode(mode);setAiProposal(null);setAiError('');}} prompt={aiPrompt} onPromptChange={setAiPrompt} busy={aiBusy} proposal={aiProposal} error={aiError} onGenerate={aiGenerate} onApply={aiApply}/>
    <div className="inspector-head"><Settings2 size={17}/><strong>Design inspector</strong></div>
    <div className="pf7-inspector-tip"><strong>✦ Edit on the canvas</strong>Select a section, then use its floating arrows to reorder. Choose any text to adjust its content and colors here.</div>
    {selected&&activeField&&<span className="pf7-selected-path">{selected.kind} → {activeField}</span>}
    {selected?<BlockInspector site={site} selected={selected} patch={patch} apply={apply} upload={upload} setSelectedId={setSelectedId}/>:<p className="muted pad">Select a block to edit.</p>}
   </aside>
  </div>
 </div>;
}
