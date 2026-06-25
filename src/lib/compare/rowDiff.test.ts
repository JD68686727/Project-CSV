import { describe, it, expect } from 'vitest';
import { diffRows } from './rowDiff';
import { makeDataset } from '@/test/factory';

const cols = [
  { name: 'id', key: 'id', type: 'string' as const },
  { name: 'status', key: 'status', type: 'number' as const },
];

const a = makeDataset(cols, [
  ['r1', 200],
  ['r2', 404],
  ['r3', 500],
]);
const b = makeDataset(cols, [
  ['r1', 200], // unchanged
  ['r2', 500], // changed (404 → 500)
  ['r4', 201], // added
]);

describe('diffRows', () => {
  it('matches on the key and classifies rows over shared columns', () => {
    const d = diffRows(a, b, 'id')!;
    expect(d.keyName).toBe('id');
    expect({
      added: d.added,
      removed: d.removed,
      changed: d.changed,
      unchanged: d.unchanged,
    }).toEqual({ added: 1, removed: 1, changed: 1, unchanged: 1 });

    expect(d.addedSample).toEqual(['r4']);
    expect(d.removedSample).toEqual(['r3']);
    expect(d.changedSample).toEqual([
      { key: 'r2', changes: [{ key: 'status', name: 'status', from: 404, to: 500 }] },
    ]);
    expect(d.duplicateKeys).toBe(false);
  });

  it('returns null when the key column is missing from a file', () => {
    expect(diffRows(a, b, 'nope')).toBeNull();
  });

  it('flags duplicate keys', () => {
    const dup = makeDataset(cols, [
      ['r1', 200],
      ['r1', 201],
    ]);
    expect(diffRows(dup, b, 'id')!.duplicateKeys).toBe(true);
  });
});
