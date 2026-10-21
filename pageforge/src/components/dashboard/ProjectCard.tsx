import {Link} from 'react-router-dom';
import {ArrowRight, ArrowUpRight, ExternalLink, Eye, Trash2} from 'lucide-react';
import type {Site} from '../../lib/types';
import {ProjectThumbnail} from './ProjectThumbnail';
import {formatDate} from './formatDate';

type Props = {site: Site; onOpen: () => void; onDelete: () => void};

/** One project card: live thumbnail, status, open/delete actions. */
export function ProjectCard({site, onOpen, onDelete}: Props) {
  return <article className="pf-dash-card">
    <div className="pf-dash-thumb">
      <ProjectThumbnail site={site}/>
      <span className="pf-dash-thumb-shield"/>
      <span className={`pf-dash-status ${site.published ? 'is-live' : ''}`}><span/>{site.published ? 'Published' : 'Draft'}</span>
      <button type="button" className="pf-dash-thumb-open" onClick={onOpen} aria-label={`Edit ${site.name}`}><ArrowUpRight size={19}/></button>
    </div>
    <div className="pf-dash-card-body">
      <div className="pf-dash-card-top"><div><h3 title={site.name}>{site.name}</h3><p>{site.description || 'Your next big project starts here.'}</p></div></div>
      <div className="pf-dash-card-meta"><span>Updated {formatDate(site.updatedAt)}</span><span>v{site.version}</span></div>
      <div className="pf-dash-card-footer">
        <button type="button" className="pf-dash-edit" onClick={onOpen}>Open editor <ArrowRight size={16}/></button>
        <div className="pf-dash-card-icons">
          <Link to={`/preview/${site.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview of ${site.name}`} title="Open preview"><Eye size={17}/></Link>
          {site.published && <Link to={`/p/${site.publishedSnapshot?.slug || site.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Published page: ${site.name}`} title="View published site"><ExternalLink size={17}/></Link>}
          <button type="button" onClick={onDelete} aria-label={`Delete ${site.name}`} title="Delete project"><Trash2 size={17}/></button>
        </div>
      </div>
    </div>
  </article>;
}
