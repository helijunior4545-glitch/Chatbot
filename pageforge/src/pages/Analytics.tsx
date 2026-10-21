import {ChartNoAxesCombined, Users, Eye, MousePointerClick} from 'lucide-react';
import type {Actor} from '../lib/types';
import {ownedWorkspaces} from '../lib/security';
import {useStore} from '../lib/useStore';
import {Shell} from './Shell';

export function Analytics({actor}:{actor:Actor}){const store=useStore();const ws=ownedWorkspaces(store,actor).map(w=>w.id);const events=store.events.filter(e=>ws.includes(e.workspaceId));const counts={page_view:events.filter(e=>e.type==='page_view').length,cta_click:events.filter(e=>e.type==='cta_click').length,lead:events.filter(e=>e.type==='lead').length};return <Shell actor={actor}><div className="page-top"><div><span className="eyebrow">PERFORMANCE</span><h1>Analytics<span className="dot">.</span></h1><p>Local demo events. These are not production metrics.</p></div></div><div className="metric-grid"><div className="metric"><Eye/><strong>{counts.page_view}</strong><small>Visits</small></div><div className="metric"><MousePointerClick/><strong>{counts.cta_click}</strong><small>CTA clicks</small></div><div className="metric"><Users/><strong>{counts.lead}</strong><small>Conversions</small></div><div className="metric"><ChartNoAxesCombined/><strong>{counts.page_view?((counts.lead/counts.page_view)*100).toFixed(1):'0'}%</strong><small>Conversion rate</small></div></div></Shell>}
