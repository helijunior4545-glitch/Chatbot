/* Base44 integration boundary: SDK client plus the AI copilot backend function. */
import {createClient} from '@base44/sdk';
import type {Actor,Site,Workspace,Lead,Event} from '../lib/types';
/* The app id is public (it is not a secret). Prefer the build-time value; otherwise
   read the id the Base44 platform injects into every published page
   (<script data-app-id="...">), so the published app needs no configuration. */
function injectedAppId(){
 if(typeof document==='undefined')return '';
 const script=document.querySelector('script[data-app-id]');
 return (script instanceof HTMLElement?script.dataset.appId||'':'').trim();
}
const configuredAppId=((import.meta.env.VITE_BASE44_APP_ID as string|undefined)||'').trim();
export const base44AppId=configuredAppId||injectedAppId();
export const base44=base44AppId?createClient({appId:base44AppId}):null;
/** Backend function that turns an editor instruction into validated operations. */
export const COPILOT_FUNCTION='pageforgeCopilot';
export async function invokeCopilot(payload:Record<string,unknown>):Promise<unknown>{
 if(!base44)throw new Error('Base44 nao configurado: defina VITE_BASE44_APP_ID (o app publicado injeta o app id na pagina).');
 return base44.functions.invoke(COPILOT_FUNCTION,payload);
}
export const entityNames={workspace:'PFWorkspace',site:'PFSite',lead:'PFLead',event:'PFEvent'} as const;
export async function currentActor():Promise<Actor>{if(!base44)throw new Error('VITE_BASE44_APP_ID is not configured');const u=await base44.auth.me();return{id:String(u.id),name:String(u.full_name||u.email||'User'),email:String(u.email||'')};}
/* Entity operations are intentionally not used by the local UI until server-side
   authorization and public snapshot publication are verified in Base44. */
export type Base44Entities={workspace:Workspace;site:Site;lead:Lead;event:Event};
export async function verifyBase44Connection(){return currentActor();}
