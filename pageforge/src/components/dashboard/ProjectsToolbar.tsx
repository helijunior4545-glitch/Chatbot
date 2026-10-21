import {ChevronDown, LayoutGrid, List, Search, X} from 'lucide-react';
import type {ProjectsView, SortMode, StatusFilter} from './types';

type Props = {
  search: string;
  filter: StatusFilter;
  sort: SortMode;
  view: ProjectsView;
  onSearch: (value: string) => void;
  onFilter: (filter: StatusFilter) => void;
  onSort: (sort: SortMode) => void;
  onView: (view: ProjectsView) => void;
};

/** Search, status filter, sorting and grid/list switch for the projects list. */
export function ProjectsToolbar({search, filter, sort, view, onSearch, onFilter, onSort, onView}: Props) {
  return <div className="pf-dash-toolbar">
    <label className="pf-dash-search"><Search size={18}/><input type="search" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search by name, description, or URL..." aria-label="Search projects"/>{search && <button type="button" aria-label="Clear search" onClick={() => onSearch('')}><X size={15}/></button>}</label>
    <div className="pf-dash-toolbar-right">
      <div className="pf-dash-filter" role="group" aria-label="Filter projects">{([['all','All'],['published','Published'],['draft','Drafts']] as const).map(([key,label]) => <button key={key} type="button" className={filter === key ? 'active' : ''} aria-pressed={filter === key} onClick={() => onFilter(key)}>{label}</button>)}</div>
      <label className="pf-dash-sort"><span className="sr-only">Sort order</span><select value={sort} onChange={e => onSort(e.target.value as SortMode)}><option value="recent">Most recent</option><option value="name">Name A–Z</option><option value="published">Published first</option></select><ChevronDown size={14}/></label>
      <div className="pf-dash-view" role="group" aria-label="View"><button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'active' : ''} onClick={() => onView('grid')}><LayoutGrid size={17}/></button><button type="button" aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => onView('list')}><List size={17}/></button></div>
    </div>
  </div>;
}
