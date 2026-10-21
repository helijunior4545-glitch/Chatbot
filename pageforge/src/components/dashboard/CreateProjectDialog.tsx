import type {RefObject} from 'react';
import {ArrowRight, Check, X} from 'lucide-react';
import {premiumTemplates, type PremiumTemplate} from '../../lib/templates';

type Props = {
  name: string;
  onNameChange: (value: string) => void;
  template: PremiumTemplate;
  onTemplateChange: (template: PremiumTemplate) => void;
  error: string;
  canSubmit: boolean;
  onSubmit: () => void;
  onClose: () => void;
  onBackdropClose: () => void;
  inputRef: RefObject<HTMLInputElement>;
};

/** Modal that names a project and picks its visual identity. */
export function CreateProjectDialog({name, onNameChange, template, onTemplateChange, error, canSubmit, onSubmit, onClose, onBackdropClose, inputRef}: Props) {
  return <div className="pf-dash-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) onBackdropClose();}}>
    <div className="pf-dash-dialog pf-dash-create-dialog" role="dialog" aria-modal="true" aria-labelledby="pf-dash-create-title">
      <div className="pf-dash-dialog-head"><div><span className="pf-dash-kicker">PAGEFORGE · DESIGN STUDIO</span><h2 id="pf-dash-create-title">Your next website starts here<span className="pf-dash-period">.</span></h2><p>Choose a professional design, name your project, and make it yours in the editor.</p></div><button type="button" className="pf-dash-close" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
      <div className="pf-dash-dialog-scroll">
        <label className="pf-dash-field">Project name<input ref={inputRef} value={name} maxLength={100} onChange={e => onNameChange(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') onSubmit();}} placeholder="e.g., Aurora Studio"/></label>
        <div className="pf-dash-chooser-title"><strong>Explore visual identities</strong><span>{premiumTemplates.length} options</span></div>
        <div className="pf-dash-chooser">{premiumTemplates.map((t,i) => <button type="button" key={t.id} className={`pf-dash-chooser-option ${template === t.id ? 'selected' : ''}`} aria-pressed={template === t.id} onClick={() => onTemplateChange(t.id)}><span className={`pf-dash-template-art pf-dash-template-art-${i % 5}`} style={{'--pf-template-bg':t.preview} as React.CSSProperties}></span><span className="pf-dash-chooser-label"><strong>{t.name}</strong><small>{t.category}</small></span>{template === t.id && <span className="pf-dash-selected-check"><Check size={13}/></span>}</button>)}</div>
        {error && <p className="pf-dash-error" role="alert">{error}</p>}
      </div>
      <div className="pf-dash-dialog-footer"><button type="button" className="pf-dash-outline" onClick={onClose}>Cancel</button><button type="button" className="pf-dash-primary" disabled={!canSubmit} onClick={onSubmit}>Create and open editor <ArrowRight size={17}/></button></div>
    </div>
  </div>;
}
