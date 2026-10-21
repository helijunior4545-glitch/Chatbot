import {describe,it,expect} from 'vitest';
import {initialStore,demoActors} from '../src/lib/local';
import {requireSite,publicSite,safeUrl,escapeHtml} from '../src/lib/security';
import {snapshot} from '../src/lib/factory';
describe('tenant boundary (local simulation)',()=>{it('rejects another owner',()=>{const s=initialStore();expect(()=>requireSite(s,demoActors[1],s.sites[0].id)).toThrow('Acesso negado')});it('allows owner',()=>{const s=initialStore();expect(requireSite(s,demoActors[0],s.sites[0].id).workspaceId).toBe('ws-ana')});it('keeps draft private',()=>{const s=initialStore();expect(publicSite(s,s.sites[0].slug)).toBe(null)});it('returns immutable published snapshot',()=>{const s=initialStore();s.sites[0].published=true;s.sites[0].publishedSnapshot=snapshot(s.sites[0]);const original=s.sites[0].publishedSnapshot.blocks[0].title;s.sites[0].blocks[0].title='changed';expect(publicSite(s,s.sites[0].slug)?.snapshot.blocks[0].title).toBe(original)})});
describe('input safety',()=>{it('blocks javascript urls',()=>expect(safeUrl('javascript:alert(1)')).toBe('#'));it('escapes HTML',()=>expect(escapeHtml('<script>')).toBe('&lt;script&gt;'))});
