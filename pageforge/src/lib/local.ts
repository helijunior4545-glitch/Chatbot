import type {Actor,Event,Lead,Site,Store,Workspace} from './types';
import {makeSite,now,uid} from './factory';
import {requireSite,canAccessWorkspace} from './security';
import {translateDemoText} from './legacyEnglish';
const KEY='pageforge-studio-v1';
export const demoActors:Actor[]=[{id:'demo-ana',name:'Ana Costa',email:'ana@demo.local'},{id:'demo-bruno',name:'Bruno Lima',email:'bruno@demo.local'}];
export function initialStore():Store{const a:Workspace={id:'ws-ana',ownerId:'demo-ana',name:'Aurora Atelier',createdAt:now()};const b:Workspace={id:'ws-bruno',ownerId:'demo-bruno',name:'North Studio',createdAt:now()};return{workspaces:[a,b],sites:[makeSite(a.id,'Aurora Studio','startup'),makeSite(b.id,'North Digital','saas')],leads:[],events:[]};}
/** Upgrade only exact known demo text, preserving user content and all IDs. */
function upgradeDemoEnglish(store:Store):Store{
  const update=(v:string)=>translateDemoText(v);
  for(const w of store.workspaces) w.name=update(w.name);
  for(const site of store.sites){
    site.name=update(site.name);
    site.description=update(site.description);
    const updateBlocks=(blocks:typeof site.blocks)=>{
      for(const block of blocks){
        block.title=update(block.title);
        block.subtitle=update(block.subtitle);
        block.body=update(block.body);
        block.buttonText=update(block.buttonText);
        block.items=block.items.map(update);
      }
    };
    updateBlocks(site.blocks);
    if(site.publishedSnapshot){
      site.publishedSnapshot.name=update(site.publishedSnapshot.name);
      site.publishedSnapshot.description=update(site.publishedSnapshot.description);
      updateBlocks(site.publishedSnapshot.blocks);
    }
  }
  return store;
}
export function readStore():Store{try{const raw=localStorage.getItem(KEY);if(raw){const obj=JSON.parse(raw);if(Array.isArray(obj.workspaces)&&Array.isArray(obj.sites)&&Array.isArray(obj.leads)&&Array.isArray(obj.events)){
      // Backup once before any automatic demo-copy migration.
      const backupKey=KEY+'-before-english-v14';
      const marker=KEY+'-english-v14';
      if(localStorage.getItem(marker)!=='1'){
        if(localStorage.getItem(backupKey)===null) {
          try { localStorage.setItem(backupKey,raw); } catch { return obj as Store; }
        }
        const translated=upgradeDemoEnglish(structuredClone(obj as Store));
        try {
          localStorage.setItem(KEY,JSON.stringify(translated));
          localStorage.setItem(marker,'1');
          return translated;
        } catch { return obj as Store; }
      }
      return obj as Store;
    }}}catch{}const value=initialStore();writeStore(value);return value;}
export function writeStore(store:Store){localStorage.setItem(KEY,JSON.stringify(store));window.dispatchEvent(new Event('pageforge:change'));}
export function mutate<T>(fn:(store:Store)=>T):T{const store=readStore();const result=fn(store);writeStore(store);return result;}
export function createWorkspace(actor:Actor,name:string){return mutate(store=>{const w:Workspace={id:uid(),ownerId:actor.id,name:name.trim(),createdAt:now()};store.workspaces.push(w);return w;});}
export function createSite(actor:Actor,workspaceId:string,name:string,preset:'startup'|'portfolio'|'saas',premiumTemplate?:'technology'|'signature'|'creative'|'impact'|'commerce'){return mutate(store=>{const ws=store.workspaces.find(w=>w.id===workspaceId);if(!ws||!canAccessWorkspace(actor,ws))throw new Error('Workspace access denied');const site=makeSite(workspaceId,name,preset,premiumTemplate);store.sites.push(site);return site;});}
export function saveSite(actor:Actor,site:Site){return mutate(store=>{requireSite(store,actor,site.id);if(site.workspaceId!==store.sites.find(s=>s.id===site.id)?.workspaceId)throw new Error('Workspace cannot be changed');if(store.sites.some(s=>s.id!==site.id&&s.slug===site.slug))throw new Error('Slug is already in use');const i=store.sites.findIndex(s=>s.id===site.id);store.sites[i]={...structuredClone(site),updatedAt:now()};return store.sites[i];});}
export function deleteSite(actor:Actor,id:string){mutate(store=>{requireSite(store,actor,id);store.sites=store.sites.filter(s=>s.id!==id);});}
export function addLead(siteId:string,lead:Pick<Lead,'name'|'email'|'message'>){mutate(store=>{const site=store.sites.find(s=>s.id===siteId&&s.published&&s.publishedSnapshot);if(!site)throw new Error('Page is not published');store.leads.push({id:uid(),siteId,workspaceId:site.workspaceId,createdAt:now(),...lead});store.events.push({id:uid(),siteId,workspaceId:site.workspaceId,type:'lead',createdAt:now()});});}
export function addEvent(siteId:string,type:Event['type']){mutate(store=>{const site=store.sites.find(s=>s.id===siteId&&s.published&&s.publishedSnapshot);if(site)store.events.push({id:uid(),siteId,workspaceId:site.workspaceId,type,createdAt:now()});});}
