import type {Site} from '../../lib/types';
import {designDirections,themeForDirection,directionOf} from '../../lib/design';
import {premiumTemplates,applyPremiumTemplate,type PremiumTemplate} from '../../lib/templates';
import type {ApplySiteChange} from './types';

type Props={site:Site;apply:ApplySiteChange;chosenTemplate:PremiumTemplate;onChooseTemplate:(template:PremiumTemplate)=>void};

/** "Style" tab: whole-page templates, art direction and fine-tuning. */
export function ThemePanel({site,apply,chosenTemplate,onChooseTemplate}:Props){
 return <div className="properties">
  <div className="pf4-template-editor">
   <h3>Complete premium templates</h3>
   <p className="pf4-template-note">Try a complete visual structure. When applying, you can choose whether to keep your current content.</p>
   <div className="pf4-template-picker">{premiumTemplates.map(t=><button type="button" key={t.id} className="pf4-template-option pf6-template-option" aria-pressed={chosenTemplate===t.id} onClick={()=>onChooseTemplate(t.id)}><span className="pf4-template-swatch" style={{background:t.preview}}/><strong>{t.name}</strong><small>{t.category}</small></button>)}</div>
   <button className="btn secondary pf4-apply" type="button" onClick={()=>apply(s=>applyPremiumTemplate(s,chosenTemplate,false))}>Apply style while keeping content</button>
   <button className="btn secondary pf4-apply" type="button" onClick={()=>{if(confirm('Replace all sections with the premium template? Your current text will be replaced. You can undo this in the editor.'))apply(s=>applyPremiumTemplate(s,chosenTemplate,true))}}>Use complete template with sample content</button>
  </div>
  <h3>Art direction</h3>
  <p className="pf-design-description">One choice transforms the entire layout without deleting your content.</p>
  <div className="pf-design-picker">{designDirections.map(d=><button key={d.id} type="button" className="pf-design-choice" aria-pressed={directionOf(site.theme)===d.id} onClick={()=>apply(s=>({...s,theme:themeForDirection(s.theme,d.id)}))}><span className="pf-design-swatch" style={{'--swatch-bg':d.id==='editorial'||d.id==='product'||d.id==='organic'?'#f2f0e9':'#10111c','--swatch-accent':d.accent} as React.CSSProperties}/><strong>{d.name}</strong><small>{d.description}</small></button>)}</div>
  <button className="btn secondary pf-design-surprise" onClick={()=>{const index=designDirections.findIndex(d=>d.id===directionOf(site.theme));const next=designDirections[(index+1)%designDirections.length];apply(s=>({...s,theme:themeForDirection(s.theme,next.id)}))}}>✦ Surprise me with another style</button>
  <h3>Fine-tune design</h3>
  {(['primary','surface','text'] as const).map(k=><label key={k}>{k==='primary'?'Primary color':k==='surface'?'Background':'Text color'}<input type="color" value={site.theme[k]} onChange={e=>apply(s=>({...s,theme:{...s.theme,[k]:e.target.value}}))}/></label>)}
  <label>Corner radius <input type="range" min="0" max="40" value={site.theme.radius} onChange={e=>apply(s=>({...s,theme:{...s.theme,radius:Number(e.target.value)}}))}/></label>
  <label>Font<select value={site.theme.font} onChange={e=>apply(s=>({...s,theme:{...s.theme,font:e.target.value}}))}><option value="Inter, system-ui, sans-serif">Inter / System</option><option value="Georgia, serif">Georgia</option><option value="Arial, sans-serif">Arial</option><option value="Verdana, sans-serif">Verdana</option></select></label>
 </div>;
}
