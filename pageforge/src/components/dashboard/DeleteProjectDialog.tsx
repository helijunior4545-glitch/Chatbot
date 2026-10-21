import type {Site} from '../../lib/types';
import {Trash2, X} from 'lucide-react';

type Props = {site: Site; error: string; onCancel: () => void; onConfirm: () => void};

/** Confirmation dialog for deleting a project. */
export function DeleteProjectDialog({site, error, onCancel, onConfirm}: Props) {
  return <div className="pf-dash-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) onCancel();}}>
    <div className="pf-dash-dialog pf-dash-small-dialog" role="alertdialog" aria-modal="true" aria-labelledby="pf-dash-delete-title" aria-describedby="pf-dash-delete-desc">
      <div className="pf-dash-dialog-head"><div><span className="pf-dash-kicker">IRREVERSIBLE ACTION</span><h2 id="pf-dash-delete-title">Delete project?</h2><p id="pf-dash-delete-desc">You are about to delete <strong>{site.name}</strong>. This action cannot be undone.</p></div><button type="button" className="pf-dash-close" onClick={onCancel} aria-label="Close"><X size={20}/></button></div>
      {error && <p className="pf-dash-error" role="alert">{error}</p>}
      <div className="pf-dash-dialog-footer"><button type="button" className="pf-dash-outline" onClick={onCancel}>Keep project</button><button type="button" className="pf-dash-danger" onClick={onConfirm}><Trash2 size={16}/> Delete permanently</button></div>
    </div>
  </div>;
}
