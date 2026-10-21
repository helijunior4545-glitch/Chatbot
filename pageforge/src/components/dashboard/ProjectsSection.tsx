import {ArrowRight, Plus, Search} from 'lucide-react';
import type {Site} from '../../lib/types';
import {ProjectCard} from './ProjectCard';
import {ProjectsToolbar} from './ProjectsToolbar';
import type {ProjectsView, SortMode, StatusFilter} from './types';

type Props = {
  siteCount: number;
  filtered: Site[];
  search: string;
  filter: StatusFilter;
  sort: SortMode;
  view: ProjectsView;
  onSearch: (value: string) => void;
  onFilter: (filter: StatusFilter) => void;
  onSort: (sort: SortMode) => void;
  onView: (view: ProjectsView) => void;
  onOpen: (site: Site) => void;
  onDelete: (site: Site) => void;
  onCreate: () => void;
  onClearFilters: () => void;
};

/** Projects section: heading, toolbar, cards, "new project" tile and empty states. */
export function ProjectsSection({siteCount, filtered, search, filter, sort, view, onSearch, onFilter, onSort, onView, onOpen, onDelete, onCreate, onClearFilters}: Props) {
  return <section className="pf-dash-projects" id="projects" aria-labelledby="pf-dash-projects-title">
    <div className="pf-dash-section-heading">
      <div><span className="pf-dash-kicker">YOUR PROJECTS</span><h2 id="pf-dash-projects-title">Your projects <span>{siteCount.toString().padStart(2,'0')}</span></h2><p>Manage, edit, and publish your pages.</p></div>
      <button type="button" className="pf-dash-outline pf-dash-heading-action" onClick={onCreate}><Plus size={16}/> New project</button>
    </div>
    <ProjectsToolbar search={search} filter={filter} sort={sort} view={view} onSearch={onSearch} onFilter={onFilter} onSort={onSort} onView={onView}/>
    {filtered.length ? <div className={`pf-dash-cards ${view === 'list' ? 'pf-dash-cards-list' : ''}`}>
      {filtered.map(s => <ProjectCard key={s.id} site={s} onOpen={() => onOpen(s)} onDelete={() => onDelete(s)}/>)}
      {filter === 'all' && !search.trim() && <button type="button" className="pf-dash-new-card" onClick={onCreate}><strong>New landing page</strong><span>Start with a template and bring your idea to life.</span><span className="pf-dash-new-link">Create project <ArrowRight size={16}/></span></button>}
    </div> : <div className="pf-dash-empty">
      <span><Search size={28}/></span>
      <h3>{siteCount ? 'No projects found' : 'Your first project starts here'}</h3>
      <p>{siteCount ? 'Try changing your filters or search.' : 'Choose a template and create your first page.'}</p>
      {siteCount ? <button type="button" className="pf-dash-outline" onClick={onClearFilters}>Clear filters</button> : <button type="button" className="pf-dash-primary" onClick={onCreate}><Plus size={17}/> Create project</button>}
    </div>}
  </section>;
}
