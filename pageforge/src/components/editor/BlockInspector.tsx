import {Copy,Eye,EyeOff,Trash2,Upload} from 'lucide-react';
import type {Block,Site} from '../../lib/types';
import {sectionRegistry,sanitizeBlockField} from '../../lib/schema';
import {uid} from '../../lib/factory';
import type {ApplySiteChange} from './types';

type Props={site:Site;selected:Block;patch:(updates:Partial<Block>)=>void;apply:ApplySiteChange;upload:(file:File)=>void;setSelectedId:(id:string)=>void};

/** Design inspector for the block currently selected on the canvas. */
export function BlockInspector({site,selected,patch,apply,upload,setSelectedId}:Props){
 const schema=sectionRegistry[selected.kind];
 return <div className="properties">
  <div className="pf5-section-inspector">
   <div className="inspector-kind">{schema.name||selected.kind.toUpperCase()}</div>
   <p className="pf5-hint">{schema.description}</p>
   <strong>Section layout</strong>
   <div className="pf5-recipe-switch">{schema.recipes.map(r=><button type="button" key={r.value} aria-pressed={(selected.recipe||'classic')===r.value} onClick={()=>patch({recipe:r.value})}>{r.label}</button>)}</div>
   {schema.fields.map(f=><label className="pf5-field" data-pf-config={f.key} key={f.key}>{f.label}
    {f.kind==='textarea'||f.kind==='list'
     ?<textarea rows={f.kind==='list'?5:3} value={f.kind==='list'?selected.items.join('\n'):String(selected[f.key]||'')} onChange={e=>patch(sanitizeBlockField(selected,f.key,e.target.value))}/>
     :f.kind==='select'
      ?<select value={String(selected[f.key]||'left')} onChange={e=>patch(sanitizeBlockField(selected,f.key,e.target.value))}>{f.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
      :<input type={f.kind==='color'?'color':'text'} value={String(selected[f.key]||((f.kind==='color')?(f.key==='background'?site.theme.surface:site.theme.text):''))} onChange={e=>patch(sanitizeBlockField(selected,f.key,e.target.value))}/>}
   </label>)}
  </div>
  <div className="pf16-color-panel">
   <div className="pf16-color-heading"><strong>Text colors</strong><small>Each color updates the selected section immediately.</small></div>
   <div className="pf16-color-grid">{([{key:'titleColor',label:'Heading'},{key:'subtitleColor',label:'Subtitle'},{key:'bodyColor',label:'Body text'}] as const).map(item=><label key={item.key} className="pf16-color-control"><span>{item.label}</span><input type="color" aria-label={`${item.label} color`} value={selected[item.key]||selected.foreground||site.theme.text} onChange={e=>patch({[item.key]:e.target.value})}/><button type="button" title={`Use section color for ${item.label}`} onClick={()=>patch({[item.key]:undefined})}>Reset</button></label>)}</div>
   <p>Section text color is the fallback. Heading, subtitle and body can override it independently.</p>
  </div>
  <label className="upload-label" data-pf-config="image"><Upload size={15}/> Upload image<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f)}}/></label>
  <label>Background color<input type="color" value={selected.background||site.theme.surface} onChange={e=>patch({background:e.target.value})}/></label>
  <label>Text color<input type="color" value={selected.foreground||site.theme.text} onChange={e=>patch({foreground:e.target.value})}/></label>
  <label>Alignment<select value={selected.align} onChange={e=>patch({align:e.target.value as Block['align']})}><option value="left">Left</option><option value="center">Center</option></select></label>
  <div className="property-actions">
   <button className="btn secondary" onClick={()=>patch({enabled:!selected.enabled})}>{selected.enabled?<EyeOff size={15}/>:<Eye size={15}/>} {selected.enabled?'Hide':'Show'}</button>
   <button className="btn secondary" onClick={()=>{const copy={...structuredClone(selected),id:uid()};apply(s=>({...s,blocks:[...s.blocks.slice(0,s.blocks.findIndex(b=>b.id===selected.id)+1),copy,...s.blocks.slice(s.blocks.findIndex(b=>b.id===selected.id)+1)]}));setSelectedId(copy.id)}}><Copy size={15}/> Duplicate</button>
   <button className="btn danger" onClick={()=>{apply(s=>({...s,blocks:s.blocks.filter(b=>b.id!==selected.id)}));setSelectedId(site.blocks.find(b=>b.id!==selected.id)?.id||'')}}><Trash2 size={15}/> Delete</button>
  </div>
 </div>;
}
