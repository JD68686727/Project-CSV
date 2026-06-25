import type { Dataset } from '@/types/dataset';
import type { SchemaDiff } from '@/types/diff';

/**
 * Column-level delta from baseline `a` to comparison `b`: which columns were
 * added / removed / changed type, and which are shared and unchanged. Matched by
 * column key (the normalized header), so order is irrelevant.
 */
export function diffSchema(a: Dataset, b: Dataset): SchemaDiff {
  const added = b.columns.filter((c) => a.columnIndex[c.key] == null);
  const removed = a.columns.filter((c) => b.columnIndex[c.key] == null);

  const typeChanged: SchemaDiff['typeChanged'] = [];
  const unchanged: SchemaDiff['unchanged'] = [];
  for (const col of a.columns) {
    const bi = b.columnIndex[col.key];
    if (bi == null) continue; // counted as removed
    const toType = b.columns[bi].type;
    if (toType !== col.type) {
      typeChanged.push({ key: col.key, name: col.name, from: col.type, to: toType });
    } else {
      unchanged.push(col);
    }
  }

  return { added, removed, typeChanged, unchanged };
}
