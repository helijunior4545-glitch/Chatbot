import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {Actor, Site} from '../lib/types';
import {createSite, createWorkspace, deleteSite} from '../lib/local';
import {ownedWorkspaces} from '../lib/security';
import type {PremiumTemplate} from '../lib/templates';
import {useStore} from '../lib/useStore';
import {Shell} from './Shell';
import {SpotlightTour} from '../components/SpotlightTour';
import {DashboardHero} from '../components/dashboard/DashboardHero';
import {WorkspaceBar} from '../components/dashboard/WorkspaceBar';
import {StatsGrid} from '../components/dashboard/StatsGrid';
import {ProjectsSection} from '../components/dashboard/ProjectsSection';
import {TemplatesSection} from '../components/dashboard/TemplatesSection';
import {CreateProjectDialog} from '../components/dashboard/CreateProjectDialog';
import {WorkspaceDialog} from '../components/dashboard/WorkspaceDialog';
import {DeleteProjectDialog} from '../components/dashboard/DeleteProjectDialog';
import type {ProjectsView, SortMode, StatusFilter} from '../components/dashboard/types';
import '../styles/pages/template-welcome-v20-3.css';

/** Dashboard shell: workspace/site selection and the create/delete flows.
 * Presentation lives in the focused components under components/dashboard. */
export function Dashboard({actor}: {actor: Actor}) {
  const store = useStore();
  const navigate = useNavigate();
  const workspaces = ownedWorkspaces(store, actor);
  const [active, setActive] = useState(workspaces[0]?.id || '');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [workspaceDialog, setWorkspaceDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [premiumTemplate, setPremiumTemplate] = useState<PremiumTemplate>('technology');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortMode>('recent');
  const [view, setView] = useState<ProjectsView>('grid');
  const [error, setError] = useState('');
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

  const openCreate = (template?: PremiumTemplate) => {setPremiumTemplate(template || 'technology');setName('');setError('');setCreating(true);};
  const closeCreate = () => setCreating(false);
  const dismissCreate = () => {setCreating(false);setError('');};
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
  const selectWorkspace = (id: string) => {setActive(id);setSearch('');setFilter('all');};

  return <Shell actor={actor} dashboard searchValue={search} onSearchChange={setSearch}>
    <div className="pf-dashboard">
      <SpotlightTour />
      <DashboardHero onCreate={() => openCreate()} />
      <WorkspaceBar workspaces={workspaces} workspaceId={workspaceId} workspaceName={workspace?.name || 'No workspace'} onSelect={selectWorkspace} onNewWorkspace={() => {setWorkspaceName('');setError('');setWorkspaceDialog(true);}}/>
      <StatsGrid sites={sites.length} published={published} views={views.length} leads={leads.length}/>
      <ProjectsSection siteCount={sites.length} filtered={filtered} search={search} filter={filter} sort={sort} view={view} onSearch={setSearch} onFilter={setFilter} onSort={setSort} onView={setView} onOpen={s => navigate(`/editor/${s.id}`)} onDelete={s => {setDeleteTarget(s);setError('');}} onCreate={() => openCreate()} onClearFilters={() => {setSearch('');setFilter('all');}}/>
      <TemplatesSection onPick={template => openCreate(template)}/>
    </div>

    {creating && <CreateProjectDialog name={name} onNameChange={setName} template={premiumTemplate} onTemplateChange={setPremiumTemplate} error={error} canSubmit={!!name.trim() && !!workspaceId} onSubmit={submitCreate} onClose={closeCreate} onBackdropClose={dismissCreate} inputRef={createInput}/>}
    {workspaceDialog && <WorkspaceDialog name={workspaceName} onNameChange={setWorkspaceName} error={error} canSubmit={!!workspaceName.trim()} onSubmit={submitWorkspace} onClose={() => setWorkspaceDialog(false)} inputRef={workspaceInput}/>}
    {deleteTarget && <DeleteProjectDialog site={deleteTarget} error={error} onCancel={() => setDeleteTarget(null)} onConfirm={submitDelete}/>}
  </Shell>;
}
