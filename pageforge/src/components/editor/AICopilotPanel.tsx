import AICopilotTyping from '../AICopilotTyping';
import type {AIResult} from '../../lib/pageforge-ai';
import type {AICopilotMode} from './types';

type Props={mode:AICopilotMode;onModeChange:(mode:AICopilotMode)=>void;prompt:string;onPromptChange:(prompt:string)=>void;busy:boolean;proposal:AIResult|null;error:string;onGenerate:()=>void;onApply:()=>void};

/** AI Design Copilot panel: prompt, proposed operations and apply/undo feedback. */
export function AICopilotPanel({mode,onModeChange,prompt,onPromptChange,busy,proposal,error,onGenerate,onApply}:Props){
 return <div className="pf-ai-panel">
  <div className="pf-ai-head"><strong>✦ AI Design Copilot</strong><select aria-label="AI mode" value={mode} onChange={e=>onModeChange(e.target.value as AICopilotMode)}><option value="mock">Mock (sem API)</option><option value="base44">IA real (API)</option></select></div>
  <AICopilotTyping />
  <textarea aria-label="AI instruction" value={prompt} onChange={e=>onPromptChange(e.target.value)} placeholder="e.g. Create a features section"/>
  <div className="pf-ai-actions"><button type="button" className="btn secondary" disabled={busy||!prompt.trim()} onClick={onGenerate}>{busy?'Generating...':'✦ Generate proposal'}</button>{proposal&&<button type="button" className="btn primary" onClick={onApply}>Apply changes</button>}</div>
  {proposal&&<div className="pf-ai-preview"><strong>{proposal.summary} ({proposal.mode})</strong><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:'10px'}}>{JSON.stringify(proposal.operations,null,2)}</pre></div>}
  {error&&<p className={error.startsWith('Alteracoes aplicadas')?'pf-ai-success':'pf-ai-error'} role="status">{error}</p>}
 </div>;
}
