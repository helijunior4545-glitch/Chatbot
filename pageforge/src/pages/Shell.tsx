import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Check, CircleHelp, ExternalLink, LogOut, UserRound, X, ChartNoAxesCombined, LayoutDashboard, Users, Search, Blocks, Bell, ChevronDown, Sparkles, Globe} from 'lucide-react';

import type {Actor} from '../lib/types';
import type {ReactNode} from 'react';
import {ACTOR_KEY} from '../lib/constants';
import {useStore} from '../lib/useStore';
import {ownedWorkspaces} from '../lib/security';
import './topbar-interactions-v20-2.css';

type TopMenu = 'notifications'|'demo'|'profile'|'workspace'|null;
const seenKey = (id:string) => `pageforge-notifications-seen-v20-2:${id}`;

export function Shell({actor,children,dashboard=false,searchValue='',onSearchChange}:{actor:Actor;children:ReactNode;dashboard?:boolean;searchValue?:string;onSearchChange?:(value:string)=>void}){
 const navigate=useNavigate();
 const store=useStore();
 const spaces=ownedWorkspaces(store,actor);
 const spaceIds=new Set(spaces.map(w=>w.id));
 const published=store.sites.filter(s=>spaceIds.has(s.workspaceId)&&s.published&&s.publishedSnapshot).sort((a,b)=>new Date(b.publishedSnapshot?.publishedAt||b.updatedAt).getTime()-new Date(a.publishedSnapshot?.publishedAt||a.updatedAt).getTime());
 const signature=published.map(s=>`${s.id}:${s.publishedSnapshot?.publishedAt||''}`).join('|');
 const [menu,setMenu]=useState<TopMenu>(null);const [pfNavOpen,setPfNavOpen]=useState(false);
 const [seen,setSeen]=useState(()=>{try{return localStorage.getItem(seenKey(actor.id))||''}catch{return ''}});
 const panelRef=useRef<HTMLDivElement>(null);
 const unread=seen!==signature;
 useEffect(()=>{setMenu(null);try{setSeen(localStorage.getItem(seenKey(actor.id))||'')}catch{setSeen('')}},[actor.id]);
 useEffect(()=>{
  if(!menu)return;
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(null)};
  const pointer=(e:PointerEvent)=>{if(panelRef.current&&!panelRef.current.contains(e.target as Node))setMenu(null)};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',pointer);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',pointer)};
 },[menu]);
 const toggle=(next:Exclude<TopMenu,null>)=>setMenu(current=>current===next?null:next);
 const markRead=()=>{try{localStorage.setItem(seenKey(actor.id),signature)}catch{}setSeen(signature)};
 const jump=(selector:string)=>{setMenu(null);navigate('/dashboard');window.setTimeout(()=>document.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'center'}),100)};
 const switchUser=()=>{localStorage.removeItem(ACTOR_KEY);location.href='/login'};
 return <div className={`app-shell pf-studio ${dashboard?'pf12-shell':''} ${pfNavOpen?'pf-nav-open':''}`}><button className="pf-mobile-scrim" type="button" aria-label="Close navigation" onClick={()=>setPfNavOpen(false)}/>
<aside className="app-nav pf-sidebar" onClickCapture={e=>{if((e.target as HTMLElement).closest('a'))setPfNavOpen(false)}}><Link className="brand" to="/dashboard"><span className="brand-symbol">◈</span><span className="pf12-brand-text">PAGEFORGE <small>STUDIO</small></span></Link><nav><Link to="/dashboard"><LayoutDashboard size={23}/> Dashboard</Link><Link to="/dashboard#projects"><Blocks size={23}/> My pages</Link><Link to="/dashboard#pf-dash-templates"><Sparkles size={23}/> Templates</Link><Link to="/leads"><Users size={23}/> Leads</Link><Link to="/analytics"><ChartNoAxesCombined size={23}/> Analytics</Link></nav><div className="nav-bottom"><span className="avatar">{actor.name.charAt(0)}</span><span><strong>{actor.name}</strong><small>Local demo environment</small></span><button title="Switch user" onClick={()=>{localStorage.removeItem(ACTOR_KEY);location.href='/login'}}><LogOut size={20}/></button></div></aside>
 <div className="app-main pf-main"><header className="pf-topbar"><button type="button" className="pf-mobile-menu" aria-label="Open navigation" aria-expanded={pfNavOpen} onClick={()=>setPfNavOpen(v=>!v)}><span aria-hidden="true">☰</span></button>{dashboard ? <>
 <div className="pf12-top-search"><Search size={21}/><input type="search" aria-label="Search projects" placeholder="Search pages and projects..." value={searchValue} onChange={e=>onSearchChange?.(e.target.value)}/></div>
 <div className="pf12-top-right pf202-top" ref={panelRef}>
 <div className="pf202-anchor"><button type="button" className="pf12-mode pf202-trigger" aria-expanded={menu==='demo'} onClick={()=>toggle('demo')}><CircleHelp size={17}/> Demo mode</button></div>
 <div className="pf202-anchor"><button type="button" className="pf12-bell pf202-trigger" aria-label="Notifications" aria-expanded={menu==='notifications'} onClick={()=>{toggle('notifications');markRead()}}><Bell size={23}/>{unread&&<span className="pf202-unread"/>}</button></div>
 <div className="pf202-anchor"><button type="button" className="pf202-profile pf202-trigger" aria-label="Account menu" aria-expanded={menu==='profile'} onClick={()=>toggle('profile')}><span className="pf12-top-avatar">{actor.name.charAt(0)}</span><span className="pf12-actor-name">{actor.name}</span></button></div>
 <div className="pf202-anchor"><button type="button" className="pf202-workspace pf202-trigger" aria-label="Workspace menu" aria-expanded={menu==='workspace'} onClick={()=>toggle('workspace')}><span className="pf12-workspace-mark"><Blocks size={23}/></span><span className="pf12-workspace-title">Workspace<small>{spaces.length===1?spaces[0].name:`${spaces.length} spaces`}</small></span><ChevronDown size={16}/></button></div>
 {menu&&<div className="pf202-popover" role="region" aria-label={`${menu} menu`}>
 <div className="pf202-popover-head"><strong>{menu==='notifications'?'Notifications':menu==='demo'?'Demo environment':menu==='profile'?'Your account':'Your workspaces'}</strong><button type="button" aria-label="Close menu" onClick={()=>setMenu(null)}><X size={17}/></button></div>
 {menu==='notifications'&&<div className="pf202-popover-body"><div className="pf202-notice pf202-welcome"><span className="pf202-symbol"><Check size={19}/></span><div><strong>Welcome to PageForge, {actor.name.split(' ')[0]}!</strong><p>Your creative workspace is ready. Start building something extraordinary.</p></div></div>{published.length?published.slice(0,5).map(site=><button className="pf202-notice pf202-notice-action" type="button" key={site.id} onClick={()=>{setMenu(null);navigate(`/editor/${site.id}`)}}><span className="pf202-symbol"><Globe size={21}/></span><span><strong>{site.name} was published</strong><small>{new Date(site.publishedSnapshot?.publishedAt||site.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · Open in editor</small></span><ExternalLink size={16}/></button>):<p className="pf202-empty">No published pages yet. Your publishing activity will appear here.</p>}<button className="pf202-footer-action" onClick={()=>jump('#projects')}>View your projects →</button></div>}
 {menu==='demo'&&<div className="pf202-popover-body"><p>This is a local demonstration. Projects, accounts and activity are stored in this browser; they are not synchronized to a server.</p><div className="pf202-tip"><Check size={17}/> You can create, edit and preview sites.</div><div className="pf202-tip"><CircleHelp size={17}/> Demo accounts are not secure logins.</div><button className="pf202-footer-action" onClick={()=>{setMenu(null);navigate('/dashboard#pf-dash-templates')}}>Explore templates →</button></div>}
 {menu==='profile'&&<div className="pf202-popover-body"><div className="pf202-identity"><span className="pf12-top-avatar">{actor.name.charAt(0)}</span><div><strong>{actor.name}</strong><small>{actor.email}</small></div></div><button className="pf202-menu-action" onClick={()=>jump('.pf-dash-workspace')}><UserRound size={18}/> My workspace</button><button className="pf202-menu-action" onClick={switchUser}><LogOut size={18}/> Switch account</button></div>}
 {menu==='workspace'&&<div className="pf202-popover-body">{spaces.map(w=><button type="button" key={w.id} className="pf202-menu-action" onClick={()=>jump('.pf-dash-workspace')}><Blocks size={20}/><span>{w.name}</span></button>)}{spaces.length===0&&<p className="pf202-empty">No workspace available.</p>}<button type="button" className="pf202-footer-action" onClick={()=>jump('.pf-dash-workspace')}>Manage workspaces →</button></div>}
 </div>}
 </div></> : <><div><Search size={20}/> PageForge Studio <span className="pf-divider">/</span> Workspace</div><span className="pf-top-user"><span className="pf-live-dot"/> Demo mode <span className="avatar">{actor.name.charAt(0)}</span></span></>}</header>{children}</div></div>;
}
