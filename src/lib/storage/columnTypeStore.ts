import type { ColumnType, Dataset } from '@/types/dataset';

const STORAGE_KEY = 'logvibe.coltypes.v1';
const MAX_SIGNATURES = 20;

/** A signature over column KEYS only — stable across type overrides. */
function keySignature(dataset: Dataset): string {
  return dataset.columns.map((c) => c.key).join('|');
}

interface Entry {
  overrides: Record<string, ColumnType>;
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

/** Remembered type overrides (column key → type) for a dataset's structure. */
export function getColumnOverrides(dataset: Dataset): Record<string, ColumnType> {
  return readAll()[keySignature(dataset)]?.overrides ?? {};
}

/** Persists a single column's type override, pruned to MAX_SIGNATURES structures. */
export function setColumnOverride(
  dataset: Dataset,
  columnKey: string,
  type: ColumnType,
): void {
  const sig = keySignature(dataset);
  const store = readAll();
  const entry = store[sig] ?? { overrides: {}, savedAt: 0 };
  entry.overrides = { ...entry.overrides, [columnKey]: type };
  entry.savedAt = Date.now();
  store[sig] = entry;

  const sigs = Object.keys(store);
  if (sigs.length > MAX_SIGNATURES) {
    sigs
      .sort((a, b) => store[a].savedAt - store[b].savedAt)
      .slice(0, sigs.length - MAX_SIGNATURES)
      .forEach((s) => delete store[s]);
  }
  writeAll(store);
}
