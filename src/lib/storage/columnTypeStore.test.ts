// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { makeDataset } from '@/test/factory';
import { getColumnOverrides, setColumnOverride } from './columnTypeStore';

const dsA = makeDataset(
  [
    { name: 'code', key: 'code', type: 'string' },
    { name: 'flag', key: 'flag', type: 'string' },
  ],
  [],
);
// Different column keys → different structure signature.
const dsB = makeDataset([{ name: 'x', key: 'x', type: 'string' }], []);

beforeEach(() => localStorage.clear());

describe('columnTypeStore', () => {
  it('round-trips overrides per structure', () => {
    expect(getColumnOverrides(dsA)).toEqual({});
    setColumnOverride(dsA, 'code', 'number');
    setColumnOverride(dsA, 'flag', 'boolean');
    expect(getColumnOverrides(dsA)).toEqual({ code: 'number', flag: 'boolean' });
  });

  it('keys by column keys, not types (stable across overrides)', () => {
    setColumnOverride(dsA, 'code', 'number');
    // Same keys but a different inferred type still resolves the same entry.
    const dsAretyped = makeDataset(
      [
        { name: 'code', key: 'code', type: 'number' },
        { name: 'flag', key: 'flag', type: 'string' },
      ],
      [],
    );
    expect(getColumnOverrides(dsAretyped)).toEqual({ code: 'number' });
    expect(getColumnOverrides(dsB)).toEqual({}); // isolated
  });

  it('degrades to empty on corrupt storage', () => {
    localStorage.setItem('logvibe.coltypes.v1', 'nope');
    expect(getColumnOverrides(dsA)).toEqual({});
  });
});
