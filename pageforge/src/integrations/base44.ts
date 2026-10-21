/* Experimental integration boundary. Confirm SDK contract and entity schemas in your Base44 app. */
import {createClient} from '@base44/sdk';
import type {Actor,Site,Workspace,Lead,Event} from '../lib/types';
const appId=import.meta.env.VITE_BASE44_APP_ID as string|undefined;
export const base44=appId?createClient({appId}):null;
export const entityNames={workspace:'PFWorkspace',site:'PFSite',lead:'PFLead',event:'PFEvent'} as const;
export async function currentActor():Promise<Actor>{if(!base44)throw new Error('VITE_BASE44_APP_ID is not configured');const u=await base44.auth.me();return{id:String(u.id),name:String(u.full_name||u.email||'User'),email:String(u.email||'')};}
/* Entity operations are intentionally not used by the local UI until server-side
   authorization and public snapshot publication are verified in Base44. */
export type Base44Entities={workspace:Workspace;site:Site;lead:Lead;event:Event};
export async function verifyBase44Connection(){return currentActor();}
