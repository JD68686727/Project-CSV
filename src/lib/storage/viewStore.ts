import type { Dataset } from '@/types/dataset';
import type { SavedView } from '@/types/view';

const STORAGE_KEY = 'logvibe.views.v1';

/**
 * Schema fingerprint: column keys + inferred types. Two files with the same
 * shape (e.g. the same export re-downloaded) share saved views, even if the
 * filename differs.
 */
export function signatureFor(dataset: Dataset): string {
  return dataset.columns.map((c) => `${c.key}:${c.type}`).join('|');
}

function readAll(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedView[]) : [];
  } catch {
    // Corrupt JSON or storage disabled — degrade to "no saved views".
    return [];
  }
}

function writeAll(views: SavedView[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    // Quota exceeded / private mode — fail silently; the app still works.
  }
}

/** Views scoped to a given schema signature, newest first. */
export function getViews(signature: string): SavedView[] {
  return readAll()
    .filter((v) => v.datasetSignature === signature)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function saveView(view: SavedView): SavedView[] {
  const all = readAll().filter((v) => v.id !== view.id);
  all.push(view);
  writeAll(all);
  return getViews(view.datasetSignature);
}

export function deleteView(id: string, signature: string): SavedView[] {
  writeAll(readAll().filter((v) => v.id !== id));
  return getViews(signature);
}
