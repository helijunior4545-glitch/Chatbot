import {Blocks, Eye, Globe, Users} from 'lucide-react';

type Props = {sites: number; published: number; views: number; leads: number};

/** Workspace counters (all local demo data). */
export function StatsGrid({sites, published, views, leads}: Props) {
  return <section className="pf-dash-stats" aria-label="Workspace metrics">
    {([{icon:Blocks,label:'Sites created',value:sites,tone:'violet'},{icon:Globe,label:'Published sites',value:published,tone:'blue'},{icon:Eye,label:'Test page views',value:views,tone:'cyan'},{icon:Users,label:'Test leads',value:leads,tone:'rose'}] as const).map(({icon:Icon,label,value,tone}) => <article className={`pf-dash-stat pf-dash-stat-${tone}`} key={label}><div className="pf12-stat-row"><span className="pf-dash-stat-icon"><Icon size={23}/></span><div><strong>{new Intl.NumberFormat('en-US').format(value)}</strong><span className="pf-dash-stat-label">{label}</span></div></div><span className="pf12-spark-bars" aria-hidden="true"><i/><i/><i/><i/><i/></span></article>)}
  </section>;
}
