import type { CellValue, Dataset } from '@/types/dataset';
import type { ChangedRow, FieldChange, RowDiff } from '@/types/diff';
import { commonColumns } from './commonColumns';

const isBlank = (v: CellValue): boolean => v == null || v === '';
const norm = (v: CellValue): string => (v == null ? '' : String(v));
/** Blank-tolerant, type-loose equality (200 === "200") for cross-file cells. */
const sameValue = (x: CellValue, y: CellValue): boolean => norm(x) === norm(y);

interface KeyIndex {
  map: Map<string, number>; // key value → first row index
  dup: boolean;
}

function indexByKey(dataset: Dataset, keyIdx: number): KeyIndex {
  const map = new Map<string, number>();
  let dup = false;
  dataset.rows.forEach((row, i) => {
    const kv = row[keyIdx];
    if (isBlank(kv)) return;
    const k = String(kv);
    if (map.has(k)) dup = true;
    else map.set(k, i);
  });
  return { map, dup };
}

const SAMPLE = 20;

/**
 * Row-level delta between two files, matched on the `keyKey` column and compared
 * over their shared (non-key) columns: how many rows were added (key only in B),
 * removed (key only in A), changed (shared columns differ) or unchanged. Returns
 * bounded samples for display. Returns null if the key is missing from a file.
 * Rows with a blank key are skipped; repeated keys take the first occurrence and
 * set `duplicateKeys`.
 */
export function diffRows(
  a: Dataset,
  b: Dataset,
  keyKey: string,
  sampleSize = SAMPLE,
): RowDiff | null {
  const aKeyIdx = a.columnIndex[keyKey];
  const bKeyIdx = b.columnIndex[keyKey];
  if (aKeyIdx == null || bKeyIdx == null) return null;

  const aIdx = indexByKey(a, aKeyIdx);
  const bIdx = indexByKey(b, bKeyIdx);
  const cols = commonColumns([a, b]).filter((c) => c.key !== keyKey);

  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;
  const addedSample: string[] = [];
  const removedSample: string[] = [];
  const changedSample: ChangedRow[] = [];

  for (const [k, ar] of aIdx.map) {
    const br = bIdx.map.get(k);
    if (br === undefined) {
      removed++;
      if (removedSample.length < sampleSize) removedSample.push(k);
      continue;
    }
    const rowA = a.rows[ar];
    const rowB = b.rows[br];
    const changes: FieldChange[] = [];
    for (const c of cols) {
      const va = rowA[a.columnIndex[c.key]];
      const vb = rowB[b.columnIndex[c.key]];
      if (!sameValue(va, vb)) changes.push({ key: c.key, name: c.name, from: va, to: vb });
    }
    if (changes.length > 0) {
      changed++;
      if (changedSample.length < sampleSize) changedSample.push({ key: k, changes });
    } else {
      unchanged++;
    }
  }

  for (const k of bIdx.map.keys()) {
    if (aIdx.map.has(k)) continue;
    added++;
    if (addedSample.length < sampleSize) addedSample.push(k);
  }

  return {
    keyName: a.columns[aKeyIdx].name,
    added,
    removed,
    changed,
    unchanged,
    changedSample,
    addedSample,
    removedSample,
    duplicateKeys: aIdx.dup || bIdx.dup,
  };
}
