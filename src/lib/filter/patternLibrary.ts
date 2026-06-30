import type { Dataset } from '@/types/dataset';

/** A ready-made search pattern for the one-click "quick filters" library. */
export interface QuickPattern {
  id: string;
  label: string;
  /** RegExp source matched against cell text (case-insensitive). */
  regex: string;
  /** Short note shown in the dropdown. */
  hint: string;
}

/**
 * Built-in patterns for common log/CSV needs. Distinctive formats (IP / MAC /
 * email / UUID) match precisely anywhere in a row; HTTP status is best-effort
 * across columns (a bare 4xx/5xx token matches) — for exactness, filter the
 * status column directly.
 */
export const PATTERN_LIBRARY: QuickPattern[] = [
  {
    id: 'ipv4',
    label: 'IPv4 address',
    regex: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    hint: 'e.g. 10.0.0.4',
  },
  {
    id: 'ipv6',
    label: 'IPv6 address',
    regex: '\\b(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}\\b',
    hint: 'e.g. fe80::1ff:fe23',
  },
  {
    id: 'mac',
    label: 'MAC address',
    regex: '\\b(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}\\b',
    hint: 'e.g. 00:1A:2B:3C:4D:5E',
  },
  {
    id: 'email',
    label: 'E-mail address',
    regex: '\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b',
    hint: 'e.g. ops@example.com',
  },
  {
    id: 'http-err',
    label: 'HTTP 4xx / 5xx',
    regex: '\\b[45]\\d{2}\\b',
    hint: 'client & server errors',
  },
  {
    id: 'uuid',
    label: 'UUID',
    regex: '\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b',
    hint: 'e.g. 550e8400-e29b-…',
  },
];

/** Cap on distinct extracted values, to bound memory + the panel. */
const EXTRACT_CAP = 1000;

/**
 * Scans the cells of `order` for every occurrence of `pattern`, returning the
 * distinct matches with their counts (most frequent first). Case-insensitive.
 */
export function extractMatches(
  dataset: Dataset,
  order: number[],
  pattern: QuickPattern,
): { value: string; count: number }[] {
  let re: RegExp;
  try {
    re = new RegExp(pattern.regex, 'gi');
  } catch {
    return [];
  }

  const counts = new Map<string, number>();
  const { rows, columns } = dataset;
  const colCount = columns.length;

  for (const rowIdx of order) {
    const row = rows[rowIdx];
    for (let c = 0; c < colCount; c++) {
      const v = row[c];
      if (v == null) continue;
      for (const m of String(v).matchAll(re)) {
        const value = m[0];
        const existing = counts.get(value);
        if (existing !== undefined) counts.set(value, existing + 1);
        else if (counts.size < EXTRACT_CAP) counts.set(value, 1);
      }
    }
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
