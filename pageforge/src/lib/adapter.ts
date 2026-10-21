import type {Site,Store} from './types';
/** Contract for storage adapters. No network or Base44 credentials are bundled. */
export interface PageForgeAdapter{
 loadWorkspace(workspaceId:string):Promise<Store>;
 saveDraft(site:Site):Promise<Site>;
 publish(site:Site):Promise<Site>;
}
export type Base44Bridge={
 loadWorkspace:(workspaceId:string)=>Promise<Store>;
 saveDraft:(site:Site)=>Promise<Site>;
 publish:(site:Site)=>Promise<Site>;
};
/** Dependency injection boundary. Pass functions backed by Base44 SDK after auth/RLS is configured. */
export function createBase44Adapter(bridge:Base44Bridge):PageForgeAdapter{
 return {loadWorkspace:bridge.loadWorkspace,saveDraft:bridge.saveDraft,publish:bridge.publish};
}
export function validateWorkspaceOwnership(site:Site,workspaceId:string):void{
 if(site.workspaceId!==workspaceId)throw new Error('The page does not belong to the requested workspace.');
}
