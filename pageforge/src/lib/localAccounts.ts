import type { Actor } from './types';
import { demoActors, mutate } from './local';

const ACCOUNTS_KEY = 'pageforge-local-accounts-v18';
const MAX_ACCOUNTS = 40;

export function getAllLocalActors(): Actor[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [...demoActors];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...demoActors];
    const extra = parsed.filter((a): a is Actor =>
      a !== null && typeof a === 'object' &&
      typeof a.id === 'string' && a.id.startsWith('local-') && a.id.length < 100 &&
      typeof a.name === 'string' && a.name.length <= 80 &&
      typeof a.email === 'string' && a.email.length <= 254
    ).slice(0, MAX_ACCOUNTS);
    return [...demoActors, ...extra];
  } catch { return [...demoActors]; }
}

export function findLocalActor(id: string | null): Actor | null {
  return getAllLocalActors().find(a => a.id === id) ?? null;
}

export function createLocalAccount(nameInput: string, emailInput: string): Actor {
  const name = nameInput.trim().replace(/\s+/g, ' ');
  const email = emailInput.trim().toLowerCase();
  if (name.length < 2 || name.length > 80) throw new Error('Enter a name between 2 and 80 characters.');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  const actors = getAllLocalActors();
  if (actors.some(a => a.email.toLowerCase() === email)) throw new Error('An account with this email already exists on this browser.');
  if (actors.length - demoActors.length >= MAX_ACCOUNTS) throw new Error('Local account limit reached.');
  const id = `local-${crypto.randomUUID()}`;
  const account: Actor = { id, name, email };
  const extra = actors.filter(a => a.id.startsWith('local-'));
  // Store both account and initial workspace. Restore account list if workspace creation fails.
  const previous = localStorage.getItem(ACCOUNTS_KEY);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...extra, account]));
  try {
    mutate(store => {
      if (store.workspaces.some(w => w.ownerId === id)) throw new Error('Workspace already exists.');
      store.workspaces.push({ id: `ws-${crypto.randomUUID()}`, ownerId: id, name: `${name}'s Studio`, createdAt: new Date().toISOString() });
    });
  } catch (error) {
    if (previous === null) localStorage.removeItem(ACCOUNTS_KEY);
    else localStorage.setItem(ACCOUNTS_KEY, previous);
    throw error;
  }
  return account;
}
