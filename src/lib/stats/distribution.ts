import type { Dataset } from '@/types/dataset';
import type { ColumnDistribution } from '@/types/stats';

const BIN_COUNT = 12;
const TOP_N = 5;
/** Cap numeric samples / distinct categories to bound memory on big files. */
const SAMPLE_CAP = 20_000;
const DISTINCT_CAP = 10_000;

/** Buckets numeric values into evenly-spaced bins (max value falls in the last bin). */
function numericHistogram(values: number[]): ColumnDistribution {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const bins = new Array<number>(BIN_COUNT).fill(0);
  if (min === max) {
    bins[0] = values.length;
    return { kind: 'numeric', bins, min, max };
  }
  const span = max - min;
  for (const v of values) {
    let bi = Math.floor(((v - min) / span) * BIN_COUNT);
    if (bi >= BIN_COUNT) bi = BIN_COUNT - 1;
    if (bi < 0) bi = 0;
    bins[bi] += 1;
  }
  return { kind: 'numeric', bins, min, max };
}

/**
 * Computes a compact distribution per column over the rows in `order` (the
 * filtered view): a histogram for numeric columns, top-N value frequencies for
 * the rest. Single O(rows × columns) pass; numeric samples and distinct
 * categories are capped to bound memory.
 */
export function computeColumnDistributions(
  dataset: Dataset,
  order: number[],
): ColumnDistribution[] {
  const cols = dataset.columns;
  const n = cols.length;
  const { rows } = dataset;

  const numericVals: number[][] = cols.map(() => []);
  const counts: Map<string, number>[] = cols.map(() => new Map());
  const capped: boolean[] = cols.map(() => false);

  for (const rowIdx of order) {
    const row = rows[rowIdx];
    for (let c = 0; c < n; c++) {
      const v = row[c];
      if (v == null || v === '') continue;

      if (cols[c].type === 'number') {
        if (numericVals[c].length < SAMPLE_CAP) {
          const num = typeof v === 'number' ? v : Number(v);
          if (!Number.isNaN(num)) numericVals[c].push(num);
        }
        continue;
      }

      const key = String(v);
      const map = counts[c];
      const current = map.get(key);
      if (current !== undefined) {
        map.set(key, current + 1);
      } else if (!capped[c]) {
        if (map.size < DISTINCT_CAP) map.set(key, 1);
        else capped[c] = true;
      }
    }
  }

  return cols.map((col, c) => {
    if (col.type === 'number') {
      return numericVals[c].length > 0
        ? numericHistogram(numericVals[c])
        : { kind: 'empty' };
    }
    const map = counts[c];
    if (map.size === 0) return { kind: 'empty' };

    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, TOP_N).map(([value, count]) => ({ value, count }));
    const total = sorted.reduce((sum, [, cnt]) => sum + cnt, 0);
    const othersCount = total - top.reduce((sum, t) => sum + t.count, 0);
    return { kind: 'categorical', top, othersCount, total };
  });
}
