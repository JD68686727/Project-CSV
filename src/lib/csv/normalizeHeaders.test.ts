import { describe, it, expect } from 'vitest';
import { normalizeHeaders } from './normalizeHeaders';

describe('normalizeHeaders', () => {
  it('lowercases and slugifies labels while keeping the original name', () => {
    const [a] = normalizeHeaders(['Status Code']);
    expect(a).toEqual({ name: 'Status Code', key: 'status_code' });
  });

  it('trims whitespace from names', () => {
    expect(normalizeHeaders(['  Level  '])[0]).toEqual({
      name: 'Level',
      key: 'level',
    });
  });

  it('disambiguates duplicate keys with a numeric suffix', () => {
    const out = normalizeHeaders(['id', 'id', 'id']);
    expect(out.map((h) => h.key)).toEqual(['id', 'id_2', 'id_3']);
  });

  it('falls back to column_N for empty/blank headers', () => {
    const out = normalizeHeaders(['', '   ']);
    expect(out.map((h) => h.key)).toEqual(['column_1', 'column_2']);
    expect(out.map((h) => h.name)).toEqual(['column_1', 'column_2']);
  });

  it('collapses runs of special characters into single underscores', () => {
    expect(normalizeHeaders(['a..b--c'])[0].key).toBe('a_b_c');
  });

  it('strips a leading UTF-8 BOM from the first header', () => {
    const bom = String.fromCharCode(0xfeff);
    expect(normalizeHeaders([`${bom}timestamp`, 'level'])).toEqual([
      { name: 'timestamp', key: 'timestamp' },
      { name: 'level', key: 'level' },
    ]);
  });
});
