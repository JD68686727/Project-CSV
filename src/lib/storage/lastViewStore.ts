import type { ViewState } from '@/types/share';

const STORAGE_KEY = 'logvibe.lastview.v1';
/** Keep the memory bounded — evict the least-recently-saved schemas. */
const MAX_SIGNATURES = 20;

interface Entry {
  view: ViewState;
  savedAt: number;
}
type Store = Record<string, Entry>;

function readAll(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Store) : {};
  } catch {
    // Corrupt JSON or storage disabled — degrade to "no memory".
    return {};
  }
}

function writeAll(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded / private mode — fail silently.
  }
}

/** The last analyze view auto-saved for a dataset schema signature, or null. */
export function getLastView(signature: string): ViewState | null {
  return readAll()[signature]?.view ?? null;
}

/**
 * Remembers the last view for a schema signature (config only, never row data),
 * pruning to the most-recently-saved MAX_SIGNATURES.
 */
export function setLastView(signature: string, view: ViewState): void {
  const store = readAll();
  store[signature] = { view, savedAt: Date.now() };

  const sigs = Object.keys(store);
  if (sigs.length > MAX_SIGNATURES) {
    sigs
      .sort((a, b) => store[a].savedAt - store[b].savedAt) // oldest first
      .slice(0, sigs.length - MAX_SIGNATURES)
      .forEach((s) => delete store[s]);
  }
  writeAll(store);
}
