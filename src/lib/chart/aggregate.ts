import type { Dataset } from '@/types/dataset';
import type { ChartConfig, ChartDatum, ChartResult, ChartType } from '@/types/chart';

/** Max categories rendered per chart type before truncation. */
const CAPS: Record<ChartType, number> = { bar: 40, line: 100, pie: 8 };

interface GroupAcc {
  sum: number;
  count: number;
  min: number;
  max: number;
  /** How many rows in the group had a usable numeric measure. */
  numCount: number;
}

/**
 * Groups the rows referenced by `order` (the current filtered view) by the
 * dimension column and reduces each group to a single value per the chosen
 * aggregation. Single O(rows) pass; operates on the index array so no row data
 * is copied. Results are ordered (value-desc for bar/pie, name-asc for line)
 * and capped per chart type.
 */
export function aggregate(
  dataset: Dataset,
  order: number[],
  config: ChartConfig,
): ChartResult {
  const dimIdx = dataset.columnIndex[config.dimensionKey];
  if (dimIdx == null) return { data: [], groupCount: 0 };

  const measIdx =
    config.measureKey != null ? dataset.columnIndex[config.measureKey] : undefined;
  const { rows } = dataset;

  const groups = new Map<string, GroupAcc>();

  for (const rowIdx of order) {
    const row = rows[rowIdx];
    const dimCell = row[dimIdx];
    const name = dimCell == null ? '(empty)' : String(dimCell);

    let g = groups.get(name);
    if (!g) {
      g = { sum: 0, count: 0, min: Infinity, max: -Infinity, numCount: 0 };
      groups.set(name, g);
    }
    g.count += 1;

    if (measIdx != null) {
      const mv = row[measIdx];
      const n = typeof mv === 'number' ? mv : Number(mv);
      if (mv != null && !Number.isNaN(n)) {
        g.sum += n;
        g.numCount += 1;
        if (n < g.min) g.min = n;
        if (n > g.max) g.max = n;
      }
    }
  }

  const data: ChartDatum[] = [];
  for (const [name, g] of groups) {
    let value: number;
    switch (config.aggregation) {
      case 'sum':
        value = g.sum;
        break;
      case 'avg':
        value = g.numCount > 0 ? g.sum / g.numCount : 0;
        break;
      case 'min':
        value = g.numCount > 0 ? g.min : 0;
        break;
      case 'max':
        value = g.numCount > 0 ? g.max : 0;
        break;
      case 'count':
      default:
        value = g.count;
        break;
    }
    data.push({ name, value, count: g.count });
  }

  if (config.type === 'line') {
    data.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  } else {
    data.sort((a, b) => b.value - a.value);
  }

  const cap = CAPS[config.type];
  return { data: data.slice(0, cap), groupCount: groups.size };
}
