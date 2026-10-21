import {Link} from 'react-router-dom';
import {ArrowLeft,Save,Globe,Undo2,Redo2,Monitor,Smartphone,Download,Eye} from 'lucide-react';
import type {Site} from '../../lib/types';
import type {EditorDevice} from './types';

type Props={site:Site;dirty:boolean;canUndo:boolean;canRedo:boolean;device:EditorDevice;onDevice:(device:EditorDevice)=>void;onUndo:()=>void;onRedo:()=>void;onSave:()=>void;onPublish:()=>void;onExportJson:()=>void;onExportHtml:()=>void;onOpenPreview:()=>void};

/** Editor header: navigation, history, responsive device switch, export and publish. */
export function EditorToolbar({site,dirty,canUndo,canRedo,device,onDevice,onUndo,onRedo,onSave,onPublish,onExportJson,onExportHtml,onOpenPreview}:Props){
 return <header className="editor-top">
  <Link to="/dashboard" className="iconbtn"><ArrowLeft size={18}/></Link>
  <div className="editor-heading"><strong>{site.name}</strong><small>{dirty?'Unsaved changes':'Draft updated'} · v{site.version}</small></div>
  <div className="editor-top-actions">
   <button className="iconbtn" title="Undo" onClick={onUndo} disabled={!canUndo}><Undo2 size={17}/></button>
   <button className="iconbtn" title="Redo" onClick={onRedo} disabled={!canRedo}><Redo2 size={17}/></button>
   <button className={`iconbtn ${device==='desktop'?'active':''}`} onClick={()=>onDevice('desktop')}><Monitor size={17}/></button>
   <button className={`iconbtn ${device==='tablet'?'active':''}`} title="Tablet 768px" onClick={()=>onDevice('tablet')}><span aria-hidden="true">▯</span></button>
   <button className={`iconbtn ${device==='mobile'?'active':''}`} onClick={()=>onDevice('mobile')}><Smartphone size={17}/></button>
   <button className="btn secondary" onClick={onExportJson}><Download size={16}/> JSON</button>
   <button className="btn secondary" onClick={onExportHtml}><Download size={16}/> HTML</button>
   <button className="btn secondary" title="Open full preview in a new tab" onClick={onOpenPreview}><Eye size={16}/> Preview</button>
   <button id="pf-save" className="btn secondary" onClick={onSave}><Save size={16}/> Save</button>
   <button className="btn primary" onClick={onPublish}><Globe size={16}/> Publish</button>
  </div>
 </header>;
}
