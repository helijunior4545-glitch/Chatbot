import type {Actor} from '../lib/types';
import {ownedWorkspaces} from '../lib/security';
import {useStore} from '../lib/useStore';
import {Shell} from './Shell';

export function Leads({actor}:{actor:Actor}){const store=useStore();const ws=ownedWorkspaces(store,actor).map(w=>w.id);const leads=store.leads.filter(l=>ws.includes(l.workspaceId));return <Shell actor={actor}><div className="page-top"><div><span className="eyebrow">AUDIENCE</span><h1>Leads<span className="dot">.</span></h1><p>Contacts received from pages published in the local environment.</p></div></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>E-mail</th><th>Message</th><th>Date</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td>{l.name}</td><td>{l.email}</td><td>{l.message}</td><td>{new Date(l.createdAt).toLocaleString('en-US')}</td></tr>)}</tbody></table>{!leads.length&&<p className="table-empty">No test leads yet.</p>}</div></Shell>}
