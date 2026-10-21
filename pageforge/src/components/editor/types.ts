import type {Site} from '../../lib/types';

export type EditorDevice = 'desktop'|'tablet'|'mobile';
export type EditorTab = 'blocks'|'theme'|'settings';
export type MobilePanel = 'preview'|'blocks'|'design';
export type AICopilotMode = 'mock'|'base44';

/** Applies a change to a cloned copy of the site, recording undo history. */
export type ApplySiteChange = (change:(site:Site)=>Site)=>void;
