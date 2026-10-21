import {Link} from 'react-router-dom';
import type {Site} from '../../lib/types';
import type {ApplySiteChange} from './types';

type Props={site:Site;apply:ApplySiteChange;onBack:()=>void};

/** "Site" tab: page identity (name, slug, description) and published link. */
export function SiteSettingsPanel({site,apply,onBack}:Props){
 return <div className="properties">
  <h3>Page settings</h3>
  <label>Name<input value={site.name} onChange={e=>apply(s=>({...s,name:e.target.value}))}/></label>
  <label>Slug<input value={site.slug} onChange={e=>apply(s=>({...s,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')}))}/></label>
  <label>Description<textarea value={site.description} onChange={e=>apply(s=>({...s,description:e.target.value}))}/></label>
  {site.published&&<Link className="btn secondary" to={`/p/${site.publishedSnapshot?.slug||site.slug}`} target="_blank">View published version ↗</Link>}
  <button className="btn secondary" onClick={onBack}>Back to dashboard</button>
 </div>;
}
