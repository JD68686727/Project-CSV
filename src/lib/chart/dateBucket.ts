import type { DateBucket } from '@/types/chart';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Collapses a timestamp into a coarser, chronologically-sortable bucket label
 * so time-series charts aggregate meaningfully instead of one point per raw
 * timestamp. Labels are zero-padded (`2026-06-19 08:00`, `2026-06`) so the
 * line-chart's lexical name sort stays chronological. Unparseable input is
 * returned as-is so no rows are silently dropped.
 */
export function bucketDate(raw: string, bucket: DateBucket): string {
  if (bucket === 'none') return raw;

  const t = Date.parse(raw);
  if (Number.isNaN(t)) return raw;

  const d = new Date(t);
  const y = d.getFullYear();
  const mo = pad(d.getMonth() + 1);
  const da = pad(d.getDate());

  switch (bucket) {
    case 'hour':
      return `${y}-${mo}-${da} ${pad(d.getHours())}:00`;
    case 'day':
      return `${y}-${mo}-${da}`;
    case 'month':
      return `${y}-${mo}`;
    case 'week': {
      // Monday-anchored week, labelled by that Monday's date.
      const daysSinceMonday = (d.getDay() + 6) % 7;
      const monday = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate() - daysSinceMonday,
      );
      return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    }
    default:
      return raw;
  }
}
