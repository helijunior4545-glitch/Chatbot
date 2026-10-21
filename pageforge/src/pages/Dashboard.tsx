import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {ArrowRight, ArrowUpRight, Blocks, Check, ChevronDown, ExternalLink, Eye, Globe, LayoutGrid, List, Plus, Search, Sparkles, Trash2, Users, X} from 'lucide-react';
import type {Actor, Site} from '../lib/types';
import {createSite, createWorkspace, deleteSite} from '../lib/local';
import {ownedWorkspaces} from '../lib/security';
import {premiumTemplates, type PremiumTemplate} from '../lib/templates';
import {useStore} from '../lib/useStore';
import {Shell} from './Shell';
import '../styles/pages/template-welcome-v20-3.css';
import {SpotlightTour} from '../components/SpotlightTour';

type SortMode = 'recent' | 'name' | 'published';
type StatusFilter = 'all' | 'published' | 'draft';
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', {day:'2-digit', month:'short', year:'numeric'}).format(date);
};


/** Preview with a stable virtual viewport: scales to the actual card width.
 * The rendered page width stays consistent between grid and list views.
 */
function ProjectThumbnail({site}: {site: Site}) {
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(1, node.getBoundingClientRect().width));
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const viewportWidth = 1280;
  const scale = width > 0 ? width / viewportWidth : 0;
  return <div ref={frame} className="pf-dash-thumb-stage" style={{visibility: width > 0 ? "visible" : "hidden"}}>
    <iframe
      title={`Thumbnail of ${site.name}`}
      src={`/preview/${site.id}?mini=1`}
      tabIndex={-1}
      loading="lazy"
      aria-hidden="true"
      scrolling="no"
      style={{width: viewportWidth, height: 720, transform: `scale(${scale})`}}
    />
  </div>;
}

export function Dashboard({actor}: {actor: Actor}) {
  const store = useStore();
  const navigate = useNavigate();
  const workspaces = ownedWorkspaces(store, actor);
  const [active, setActive] = useState(workspaces[0]?.id || '');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  // PF V20.4: welcome once per actor; browsing does not dismiss onboarding.
  const welcomeKey = `pageforge:welcome-templates-v20-4:${actor.id}`;
  useEffect(() => {
    try { if (localStorage.getItem(welcomeKey) === 'seen') return; } catch { return; }
    if (document.hidden) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || document.hidden) return;
      // Existing project modal, with Aether selected by default.
      setPremiumTemplate('technology');
      setName('');
      setError('');
      setCreating(true);
      try { localStorage.setItem(welcomeKey, 'seen'); } catch {}
    }, 5000);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [welcomeKey]);

  const [workspaceDialog, setWorkspaceDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [premiumTemplate, setPremiumTemplate] = useState<PremiumTemplate>('technology');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortMode>('recent');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [error, setError] = useState('');
  // Hero: fixed first line; second line types and cycles.
  const heroPhrases = ['without limits.', 'with total freedom.', 'in just a few clicks.', 'your way.'] as const;
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [heroChars, setHeroChars] = useState(0);
  const [heroDeleting, setHeroDeleting] = useState(false);
  const [heroMotionReduced, setHeroMotionReduced] = useState(false);
  const [heroTabVisible, setHeroTabVisible] = useState(true);

  const createInput = useRef<HTMLInputElement>(null);
  const workspaceInput = useRef<HTMLInputElement>(null);
  const workspaceId = workspaces.some(w => w.id === active) ? active : workspaces[0]?.id || '';
  const workspace = workspaces.find(w => w.id === workspaceId);
  const sites = useMemo(() => store.sites.filter(s => s.workspaceId === workspaceId), [store.sites, workspaceId]);
  const leads = store.leads.filter(l => l.workspaceId === workspaceId);
  const views = store.events.filter(e => e.workspaceId === workspaceId && e.type === 'page_view');
  const published = sites.filter(s => s.published).length;
  const filtered = useMemo(() => sites.filter(s => {
    const q = search.trim().toLocaleLowerCase('en-US');
    return (!q || `${s.name} ${s.description} ${s.slug}`.toLocaleLowerCase('en-US').includes(q)) &&
      (filter === 'all' || (filter === 'published' ? s.published : !s.published));
  }).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name, 'en-US') : sort === 'published' ? Number(b.published) - Number(a.published) : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [sites, search, filter, sort]);

  useEffect(() => {
    if (!creating && !workspaceDialog && !deleteTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {setCreating(false);setWorkspaceDialog(false);setDeleteTarget(null);setError('');}
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [creating, workspaceDialog, deleteTarget]);
  useEffect(() => {if (creating) createInput.current?.focus();}, [creating]);
  useEffect(() => {if (workspaceDialog) workspaceInput.current?.focus();}, [workspaceDialog]);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setHeroMotionReduced(preference.matches);
    const syncVisibility = () => setHeroTabVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener('change', syncPreference);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      preference.removeEventListener('change', syncPreference);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (heroMotionReduced || !heroTabVisible) return;
    const phrase = heroPhrases[heroPhraseIndex];
    const finished = heroChars === phrase.length && !heroDeleting;
    const erased = heroChars === 0 && heroDeleting;
    const delay = finished ? 2300 : erased ? 380 : heroDeleting ? 43 : 82;
    const timeout = window.setTimeout(() => {
      if (finished) {setHeroDeleting(true);return;}
      if (erased) {
        setHeroDeleting(false);
        setHeroPhraseIndex(i => (i + 1) % heroPhrases.length);
        return;
      }
      setHeroChars(n => Math.max(0, Math.min(phrase.length, n + (heroDeleting ? -1 : 1))));
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [heroPhraseIndex, heroChars, heroDeleting, heroMotionReduced, heroTabVisible]);


  const openCreate = (template?: PremiumTemplate) => {setPremiumTemplate(template || 'technology');setName('');setError('');setCreating(true);};
  const submitCreate = () => {
    if (!name.trim() || !workspaceId) return;
    try {
      const preset = premiumTemplate === 'technology' || premiumTemplate === 'commerce' ? 'saas' : premiumTemplate === 'signature' || premiumTemplate === 'impact' ? 'startup' : 'portfolio';
      const site = createSite(actor, workspaceId, name.trim(), preset, premiumTemplate);
      setCreating(false);
      navigate(`/editor/${site.id}`);
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to create the project.');}
  };
  const submitWorkspace = () => {
    if (!workspaceName.trim()) return;
    try {const w = createWorkspace(actor, workspaceName.trim());setActive(w.id);setWorkspaceDialog(false);setWorkspaceName('');setSearch('');setFilter('all');setError('');}
    catch (e) {setError(e instanceof Error ? e.message : 'Unable to create the workspace.');}
  };
  const submitDelete = () => {
    if (!deleteTarget) return;
    try {deleteSite(actor, deleteTarget.id);setDeleteTarget(null);setError('');}
    catch (e) {setError(e instanceof Error ? e.message : 'Unable to delete the page.');}
  };

  return <Shell actor={actor} dashboard searchValue={search} onSearchChange={setSearch}>
    <div className="pf-dashboard">
      <SpotlightTour />
      
      <section className="pf-dash-hero" aria-labelledby="pf-dash-title">
        <div className="pf-dash-hero-copy"><span className="pf-dash-kicker"><Sparkles size={15}/> PAGEFORGE STUDIO</span><h1 id="pf-dash-title">Create incredible websites<br/><em className="pf13-type-line">{heroMotionReduced ? heroPhrases[0] : heroPhrases[heroPhraseIndex].slice(0, heroChars)}<span className="pf13-type-cursor" aria-hidden="true"/></em></h1><p>Professional design, an advanced visual editor, and publishing in just a few steps.</p><div className="pf-dash-hero-actions"><button type="button" className="pf15-tour-launch" onClick={() => window.dispatchEvent(new Event('pageforge:start-tour'))}><Sparkles size={15}/> Take a 60-second tour</button><button type="button" className="pf-dash-primary" onClick={() => openCreate()}><Plus size={18}/> Create page <ArrowRight size={17}/></button><a className="pf-dash-ghost" href="#pf-dash-templates">Explore templates <ArrowUpRight size={16}/></a></div></div>
        <div className="pf12-hero-message" aria-hidden="true"><span className="pf12-message-icon"><Sparkles size={20}/></span><span>Turn ideas<br/>into extraordinary<br/>digital experiences.</span><ArrowUpRight size={18}/></div>
      </section>

      <div className="pf-dash-workspace"><div className="pf-dash-workspace-label"><span className="pf-dash-workspace-icon"><Blocks size={19}/></span><div><small>CURRENT WORKSPACE</small><strong>{workspace?.name || 'No workspace'}</strong></div></div><div className="pf-dash-workspace-controls"><label className="pf-dash-select-wrap"><span className="sr-only">Select workspace</span><select value={workspaceId} onChange={e => {setActive(e.target.value);setSearch('');setFilter('all');}}>{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select><ChevronDown size={15}/></label><button type="button" className="pf-dash-outline" onClick={() => {setWorkspaceName('');setError('');setWorkspaceDialog(true);}}><Plus size={16}/> New workspace</button></div></div>

      <section className="pf-dash-stats" aria-label="Workspace metrics">
        {([{icon:Blocks,label:'Sites created',value:sites.length,tone:'violet'},{icon:Globe,label:'Published sites',value:published,tone:'blue'},{icon:Eye,label:'Test page views',value:views.length,tone:'cyan'},{icon:Users,label:'Test leads',value:leads.length,tone:'rose'}] as const).map(({icon:Icon,label,value,tone}) => <article className={`pf-dash-stat pf-dash-stat-${tone}`} key={label}><div className="pf12-stat-row"><span className="pf-dash-stat-icon"><Icon size={23}/></span><div><strong>{new Intl.NumberFormat('en-US').format(value)}</strong><span className="pf-dash-stat-label">{label}</span></div></div><span className="pf12-spark-bars" aria-hidden="true"><i/><i/><i/><i/><i/></span></article>)}
      </section>

      <section className="pf-dash-projects" id="projects" aria-labelledby="pf-dash-projects-title"><div className="pf-dash-section-heading"><div><span className="pf-dash-kicker">YOUR PROJECTS</span><h2 id="pf-dash-projects-title">Your projects <span>{sites.length.toString().padStart(2,'0')}</span></h2><p>Manage, edit, and publish your pages.</p></div><button type="button" className="pf-dash-outline pf-dash-heading-action" onClick={() => openCreate()}><Plus size={16}/> New project</button></div>
        <div className="pf-dash-toolbar"><label className="pf-dash-search"><Search size={18}/><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, description, or URL..." aria-label="Search projects"/>{search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><X size={15}/></button>}</label><div className="pf-dash-toolbar-right"><div className="pf-dash-filter" role="group" aria-label="Filter projects">{([['all','All'],['published','Published'],['draft','Drafts']] as const).map(([key,label]) => <button key={key} type="button" className={filter === key ? 'active' : ''} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div><label className="pf-dash-sort"><span className="sr-only">Sort order</span><select value={sort} onChange={e => setSort(e.target.value as SortMode)}><option value="recent">Most recent</option><option value="name">Name A–Z</option><option value="published">Published first</option></select><ChevronDown size={14}/></label><div className="pf-dash-view" role="group" aria-label="View"><button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><LayoutGrid size={17}/></button><button type="button" aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={17}/></button></div></div></div>
        {filtered.length ? <div className={`pf-dash-cards ${view === 'list' ? 'pf-dash-cards-list' : ''}`}>
          {filtered.map(s => <article className="pf-dash-card" key={s.id}><div className="pf-dash-thumb"><ProjectThumbnail site={s}/><span className="pf-dash-thumb-shield"/><span className={`pf-dash-status ${s.published ? 'is-live' : ''}`}><span/>{s.published ? 'Published' : 'Draft'}</span><button type="button" className="pf-dash-thumb-open" onClick={() => navigate(`/editor/${s.id}`)} aria-label={`Edit ${s.name}`}><ArrowUpRight size={19}/></button></div><div className="pf-dash-card-body"><div className="pf-dash-card-top"><div><h3 title={s.name}>{s.name}</h3><p>{s.description || 'Your next big project starts here.'}</p></div></div><div className="pf-dash-card-meta"><span>Updated {formatDate(s.updatedAt)}</span><span>v{s.version}</span></div><div className="pf-dash-card-footer"><button type="button" className="pf-dash-edit" onClick={() => navigate(`/editor/${s.id}`)}>Open editor <ArrowRight size={16}/></button><div className="pf-dash-card-icons"><Link to={`/preview/${s.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Preview of ${s.name}`} title="Open preview"><Eye size={17}/></Link>{s.published && <Link to={`/p/${s.publishedSnapshot?.slug || s.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Published page: ${s.name}`} title="View published site"><ExternalLink size={17}/></Link>}<button type="button" onClick={() => {setDeleteTarget(s);setError('');}} aria-label={`Delete ${s.name}`} title="Delete project"><Trash2 size={17}/></button></div></div></div></article>)}
          {filter === 'all' && !search.trim() && <button type="button" className="pf-dash-new-card" onClick={() => openCreate()}><strong>New landing page</strong><span>Start with a template and bring your idea to life.</span><span className="pf-dash-new-link">Create project <ArrowRight size={16}/></span></button>}
        </div> : <div className="pf-dash-empty"><span><Search size={28}/></span><h3>{sites.length ? 'No projects found' : 'Your first project starts here'}</h3><p>{sites.length ? 'Try changing your filters or search.' : 'Choose a template and create your first page.'}</p>{sites.length ? <button type="button" className="pf-dash-outline" onClick={() => {setSearch('');setFilter('all');}}>Clear filters</button> : <button type="button" className="pf-dash-primary" onClick={() => openCreate()}><Plus size={17}/> Create project</button>}</div>}
      </section>

      <section className="pf-dash-templates" id="pf-dash-templates" aria-labelledby="pf-dash-templates-title"><div className="pf-dash-section-heading"><div><span className="pf-dash-kicker">CURATED COLLECTION</span><h2 id="pf-dash-templates-title">Professional templates<span className="pf-dash-period">.</span></h2><p>A distinctive visual identity for every project.</p></div></div><div className="pf-dash-template-grid">{premiumTemplates.map((t,i) => <button type="button" className="pf-dash-template" key={t.id} onClick={() => openCreate(t.id)}><span className={`pf-dash-template-art pf-dash-template-art-${i % 5}`} style={{'--pf-template-bg':t.preview} as React.CSSProperties}></span><span className="pf-dash-template-bottom"><span><strong>{t.name}</strong><small>{t.category}</small></span><ArrowUpRight size={18}/></span></button>)}</div></section>
    </div>

    {creating && <div className="pf-dash-backdrop" onMouseDown={e => {if(e.target === e.currentTarget){setCreating(false);setError('');}}}><div className="pf-dash-dialog pf-dash-create-dialog" role="dialog" aria-modal="true" aria-labelledby="pf-dash-create-title"><div className="pf-dash-dialog-head"><div><span className="pf-dash-kicker">PAGEFORGE · DESIGN STUDIO</span><h2 id="pf-dash-create-title">Your next website starts here<span className="pf-dash-period">.</span></h2><p>Choose a professional design, name your project, and make it yours in the editor.</p></div><button type="button" className="pf-dash-close" onClick={() => setCreating(false)} aria-label="Close"><X size={20}/></button></div><div className="pf-dash-dialog-scroll"><label className="pf-dash-field">Project name<input ref={createInput} value={name} maxLength={100} onChange={e => setName(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') submitCreate();}} placeholder="e.g., Aurora Studio"/></label><div className="pf-dash-chooser-title"><strong>Explore visual identities</strong><span>{premiumTemplates.length} options</span></div><div className="pf-dash-chooser">{premiumTemplates.map((t,i) => <button type="button" key={t.id} className={`pf-dash-chooser-option ${premiumTemplate === t.id ? 'selected' : ''}`} aria-pressed={premiumTemplate === t.id} onClick={() => setPremiumTemplate(t.id)}><span className={`pf-dash-template-art pf-dash-template-art-${i % 5}`} style={{'--pf-template-bg':t.preview} as React.CSSProperties}></span><span className="pf-dash-chooser-label"><strong>{t.name}</strong><small>{t.category}</small></span>{premiumTemplate === t.id && <span className="pf-dash-selected-check"><Check size={13}/></span>}</button>)}</div>{error && <p className="pf-dash-error" role="alert">{error}</p>}</div><div className="pf-dash-dialog-footer"><button type="button" className="pf-dash-outline" onClick={() => setCreating(false)}>Cancel</button><button type="button" className="pf-dash-primary" disabled={!name.trim() || !workspaceId} onClick={submitCreate}>Create and open editor <ArrowRight size={17}/></button></div></div></div>}

    {workspaceDialog && <div className="pf-dash-backdrop" onMouseDown={e => {if(e.target === e.currentTarget)setWorkspaceDialog(false);}}><div className="pf-dash-dialog pf-dash-small-dialog" role="dialog" aria-modal="true" aria-labelledby="pf-dash-workspace-title"><div className="pf-dash-dialog-head"><div><span className="pf-dash-kicker">ORGANIZATION</span><h2 id="pf-dash-workspace-title">New workspace</h2><p>Organize your projects in a dedicated workspace.</p></div><button type="button" className="pf-dash-close" onClick={() => setWorkspaceDialog(false)} aria-label="Close"><X size={20}/></button></div><label className="pf-dash-field">Workspace name<input ref={workspaceInput} maxLength={100} value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} onKeyDown={e => {if(e.key === 'Enter') submitWorkspace();}} placeholder="e.g., My agency"/></label>{error && <p className="pf-dash-error" role="alert">{error}</p>}<div className="pf-dash-dialog-footer"><button type="button" className="pf-dash-outline" onClick={() => setWorkspaceDialog(false)}>Cancel</button><button type="button" className="pf-dash-primary" disabled={!workspaceName.trim()} onClick={submitWorkspace}>Create workspace <ArrowRight size={16}/></button></div></div></div>}

    {deleteTarget && <div className="pf-dash-backdrop" onMouseDown={e => {if(e.target === e.currentTarget)setDeleteTarget(null);}}><div className="pf-dash-dialog pf-dash-small-dialog" role="alertdialog" aria-modal="true" aria-labelledby="pf-dash-delete-title" aria-describedby="pf-dash-delete-desc"><div className="pf-dash-dialog-head"><div><span className="pf-dash-kicker">IRREVERSIBLE ACTION</span><h2 id="pf-dash-delete-title">Delete project?</h2><p id="pf-dash-delete-desc">You are about to delete <strong>{deleteTarget.name}</strong>. This action cannot be undone.</p></div><button type="button" className="pf-dash-close" onClick={() => setDeleteTarget(null)} aria-label="Close"><X size={20}/></button></div>{error && <p className="pf-dash-error" role="alert">{error}</p>}<div className="pf-dash-dialog-footer"><button type="button" className="pf-dash-outline" onClick={() => setDeleteTarget(null)}>Keep project</button><button type="button" className="pf-dash-danger" onClick={submitDelete}><Trash2 size={16}/> Delete permanently</button></div></div></div>}
  </Shell>;
}
