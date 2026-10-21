import type {Actor,Site,Store,Workspace} from './types';
export function ownedWorkspaces(store:Store,actor:Actor){return store.workspaces.filter(w=>w.ownerId===actor.id)}
export function canAccessWorkspace(actor:Actor,workspace:Workspace){return workspace.ownerId===actor.id}
export function requireSite(store:Store,actor:Actor,siteId:string):Site{const site=store.sites.find(s=>s.id===siteId);if(!site)throw new Error('Page not found');const workspace=store.workspaces.find(w=>w.id===site.workspaceId);if(!workspace||!canAccessWorkspace(actor,workspace))throw new Error('Access denied');return site}
export function publicSite(store:Store,slug:string){const site=store.sites.find(s=>s.slug===slug&&s.published&&s.publishedSnapshot);return site?.publishedSnapshot?{site,snapshot:site.publishedSnapshot}:null}
export function safeUrl(url:string){const v=url.trim();if(v.startsWith('#')||v.startsWith('/'))return v;try{const u=new URL(v);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?v:'#'}catch{return '#'}}
export function escapeHtml(value:string){return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch))}
