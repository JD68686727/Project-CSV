/**
 * Single source of truth for displaying numbers across LogVibe (table, chart,
 * stats). Pins an explicit locale so grouping is unambiguous and identical for
 * every user — without this, `toLocaleString()` follows the viewer's machine
 * locale and 1203 can render as "1.203", which an English reader misreads as
 * 1.203 rather than 1,203.
 *
 * Note: this is display-only. CSV export intentionally emits raw values so the
 * output re-imports cleanly.
 */
const DISPLAY_LOCALE = 'en-US';

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(DISPLAY_LOCALE, { maximumFractionDigits });
}
