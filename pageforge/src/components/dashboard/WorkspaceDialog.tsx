import type {RefObject} from 'react';
import {ArrowRight, X} from 'lucide-react';

type Props = {
  name: string;
  onNameChange: (value: string) => void;
  error: string;
  canSubmit: boolean;
  onSubmit: () => void;
  onClose: () => void;
  inputRef: RefObject<HTMLInputElement>;
};

/** Modal that creates a new workspace. */
export function WorkspaceDialog({name, onNameChange, error, canSubmit, onSubmit, onClose, inputRef}: Props) {
  return <div className="pf-dash-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) onClose();}}>
    <div className="pf-dash-dialog pf-dash-small-dialog" role="dialog" aria-modal="true" aria-labelledby="pf-dash-workspace-title">
      <div className="pf-dash-dialog-head"><div><span className="pf-dash-kicker">ORGANIZATION</span><h2 id="pf-dash-workspace-title">New workspace</h2><p>Organize your projects in a dedicated workspace.</p></div><button type="button" className="pf-dash-close" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
      <label className="pf-dash-field">Workspace name<input ref={inputRef} maxLength={100} value={name} onChange={e => onNameChange(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') onSubmit();}} placeholder="e.g., My agency"/></label>
      {error && <p className="pf-dash-error" role="alert">{error}</p>}
      <div className="pf-dash-dialog-footer"><button type="button" className="pf-dash-outline" onClick={onClose}>Cancel</button><button type="button" className="pf-dash-primary" disabled={!canSubmit} onClick={onSubmit}>Create workspace <ArrowRight size={16}/></button></div>
    </div>
  </div>;
}
