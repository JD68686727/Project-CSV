import type { ColumnSchema } from '@/types/dataset';
import type { ColumnViewItem } from '@/types/table';

/** All columns visible, in their original order. */
export function initColumnView(columns: ColumnSchema[]): ColumnViewItem[] {
  return columns.map((c) => ({ key: c.key, visible: true }));
}

export function toggleColumn(
  view: ColumnViewItem[],
  key: string,
): ColumnViewItem[] {
  return view.map((i) => (i.key === key ? { ...i, visible: !i.visible } : i));
}

/** Swaps a column one slot up or down; a no-op at the ends. */
export function moveColumn(
  view: ColumnViewItem[],
  key: string,
  dir: 'up' | 'down',
): ColumnViewItem[] {
  const idx = view.findIndex((i) => i.key === key);
  if (idx === -1) return view;
  const swap = dir === 'up' ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= view.length) return view;
  const next = view.slice();
  [next[idx], next[swap]] = [next[swap], next[idx]];
  return next;
}

/**
 * Re-applies a saved view onto the current columns: keeps saved order/visibility
 * for keys that still exist, drops unknown keys, and appends any new columns as
 * visible. Keeps presets robust if a file's schema drifts.
 */
export function reconcileColumnView(
  saved: ColumnViewItem[],
  columns: ColumnSchema[],
): ColumnViewItem[] {
  const known = new Set(columns.map((c) => c.key));
  const kept = saved.filter((i) => known.has(i.key));
  const keptKeys = new Set(kept.map((i) => i.key));
  const appended = columns
    .filter((c) => !keptKeys.has(c.key))
    .map((c) => ({ key: c.key, visible: true }));
  return [...kept, ...appended];
}

/** Visible columns as ordered ColumnSchema[] (skips hidden / unknown keys). */
export function visibleColumns(
  view: ColumnViewItem[],
  byKey: Map<string, ColumnSchema>,
): ColumnSchema[] {
  const out: ColumnSchema[] = [];
  for (const item of view) {
    if (!item.visible) continue;
    const col = byKey.get(item.key);
    if (col) out.push(col);
  }
  return out;
}
