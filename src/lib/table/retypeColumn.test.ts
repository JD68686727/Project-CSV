import { describe, it, expect } from 'vitest';
import { applyTypeOverrides, retypeColumn } from './retypeColumn';
import { makeDataset } from '@/test/factory';

const ds = makeDataset(
  [
    { name: 'code', key: 'code', type: 'string' },
    { name: 'flag', key: 'flag', type: 'string' },
  ],
  [
    ['200', 'true'],
    ['404', 'false'],
    ['', 'true'],
  ],
);

describe('retypeColumn', () => {
  it('re-coerces a string column to numbers', () => {
    const out = retypeColumn(ds, 'code', 'number');
    expect(out.columns[0].type).toBe('number');
    expect(out.rows.map((r) => r[0])).toEqual([200, 404, null]); // '' → null
    expect(out.rows.map((r) => r[1])).toEqual(['true', 'false', 'true']); // untouched
    expect(out).not.toBe(ds); // immutable
  });

  it('re-coerces a string column to booleans', () => {
    const out = retypeColumn(ds, 'flag', 'boolean');
    expect(out.rows.map((r) => r[1])).toEqual([true, false, true]);
  });

  it('round-trips number → string', () => {
    const num = retypeColumn(ds, 'code', 'number');
    const back = retypeColumn(num, 'code', 'string');
    expect(back.rows.map((r) => r[0])).toEqual(['200', '404', null]);
  });

  it('is a no-op for the same type or an unknown column', () => {
    expect(retypeColumn(ds, 'code', 'string')).toBe(ds);
    expect(retypeColumn(ds, 'nope', 'number')).toBe(ds);
  });
});

describe('applyTypeOverrides', () => {
  it('applies multiple overrides in one pass', () => {
    const out = applyTypeOverrides(ds, { code: 'number', flag: 'boolean' });
    expect(out.columns.map((c) => c.type)).toEqual(['number', 'boolean']);
    expect(out.rows[0]).toEqual([200, true]);
    expect(applyTypeOverrides(ds, {})).toBe(ds);
  });
});
