import {Blocks, ChevronDown, Plus} from 'lucide-react';
import type {Workspace} from '../../lib/types';

type Props = {
  workspaces: Workspace[];
  workspaceId: string;
  workspaceName: string;
  onSelect: (id: string) => void;
  onNewWorkspace: () => void;
};

/** Current-workspace indicator with its selector and the "new workspace" action. */
export function WorkspaceBar({workspaces, workspaceId, workspaceName, onSelect, onNewWorkspace}: Props) {
  return <div className="pf-dash-workspace">
    <div className="pf-dash-workspace-label"><span className="pf-dash-workspace-icon"><Blocks size={19}/></span><div><small>CURRENT WORKSPACE</small><strong>{workspaceName}</strong></div></div>
    <div className="pf-dash-workspace-controls">
      <label className="pf-dash-select-wrap"><span className="sr-only">Select workspace</span><select value={workspaceId} onChange={e => onSelect(e.target.value)}>{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select><ChevronDown size={15}/></label>
      <button type="button" className="pf-dash-outline" onClick={onNewWorkspace}><Plus size={16}/> New workspace</button>
    </div>
  </div>;
}
