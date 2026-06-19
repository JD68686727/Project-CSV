import type { ColumnSchema, ColumnType } from '@/types/dataset';
import { normalizeHeaders } from './normalizeHeaders';

const BOOLEAN_SET = new Set(['true', 'false', 'yes', 'no']);
// ISO-ish date detection without pulling in a date library.
const DATE_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/;

const ORDERED_TYPES: ColumnType[] = ['string', 'number', 'boolean', 'date'];

export function classify(value: string): ColumnType {
  const v = value.trim();
  if (v === '') return 'string';
  if (BOOLEAN_SET.has(v.toLowerCase())) return 'boolean';
  if (!Number.isNaN(Number(v)) && /\d/.test(v)) return 'number';
  if (DATE_RE.test(v)) return 'date';
  return 'string';
}

/**
 * Infers a column type per column by sampling the first N non-empty rows.
 * Sampling (not full scan) keeps inference O(columns × sampleSize) instead of
 * O(columns × rowCount) — essential for large files.
 */
export function inferSchema(
  rawHeaders: string[],
  sampleRows: string[][],
  sampleSize = 50,
): ColumnSchema[] {
  const headers = normalizeHeaders(rawHeaders);
  const sample = sampleRows.slice(0, sampleSize);

  return headers.map(({ name, key }, colIdx) => {
    const votes: Record<ColumnType, number> = {
      string: 0,
      number: 0,
      boolean: 0,
      date: 0,
    };

    for (const row of sample) {
      const cell = row[colIdx];
      if (cell == null || cell.trim() === '') continue;
      votes[classify(cell)] += 1;
    }

    // Pick the winning type; default to string when there's no signal.
    let type: ColumnType = 'string';
    for (const t of ORDERED_TYPES) {
      if (votes[t] > votes[type]) type = t;
    }

    return { name, key, type: votes[type] === 0 ? 'string' : type };
  });
}
