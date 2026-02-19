import type { Team, PendingItem } from '../types';
import { MOCK_TEAMS, MOCK_PENDING_ITEMS } from './mockData';

const STORAGE_KEY_TEAM = 'ste-project-current-team';
const STORAGE_KEY_ITEMS = 'ste-project-pending-items';

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/** Load current team from localStorage, or null. */
export function loadCurrentTeam(): Team | null {
  return safeParse<Team | null>(STORAGE_KEY_TEAM, null);
}

/** Save current team to localStorage. */
export function saveCurrentTeam(team: Team | null): void {
  safeSet(STORAGE_KEY_TEAM, team);
}

/** Load pending items from localStorage, or fall back to mock data. */
export function loadPendingItems(): PendingItem[] {
  const stored = safeParse<PendingItem[] | null>(STORAGE_KEY_ITEMS, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  return [...MOCK_PENDING_ITEMS];
}

/** Save pending items to localStorage. */
export function savePendingItems(items: PendingItem[]): void {
  safeSet(STORAGE_KEY_ITEMS, items);
}

/** Teams are static; use mock list. */
export function loadTeams(): Team[] {
  return [...MOCK_TEAMS];
}
