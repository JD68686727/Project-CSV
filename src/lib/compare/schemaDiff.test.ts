import { describe, it, expect } from 'vitest';
import { diffSchema } from './schemaDiff';
import { makeDataset } from '@/test/factory';

const a = makeDataset(
  [
    { name: 'id', key: 'id', type: 'number' },
    { name: 'level', key: 'level', type: 'string' },
    { name: 'referrer', key: 'referrer', type: 'string' },
  ],
  [],
);
const b = makeDataset(
  [
    { name: 'id', key: 'id', type: 'string' }, // type changed
    { name: 'level', key: 'level', type: 'string' }, // unchanged
    { name: 'bytes', key: 'bytes', type: 'number' }, // added
  ],
  [],
);

describe('diffSchema', () => {
  it('classifies added / removed / type-changed / unchanged columns', () => {
    const d = diffSchema(a, b);
    expect(d.added.map((c) => c.key)).toEqual(['bytes']);
    expect(d.removed.map((c) => c.key)).toEqual(['referrer']);
    expect(d.typeChanged).toEqual([
      { key: 'id', name: 'id', from: 'number', to: 'string' },
    ]);
    expect(d.unchanged.map((c) => c.key)).toEqual(['level']);
  });

  it('is empty-delta for identical schemas', () => {
    const d = diffSchema(a, a);
    expect(d.added).toHaveLength(0);
    expect(d.removed).toHaveLength(0);
    expect(d.typeChanged).toHaveLength(0);
    expect(d.unchanged).toHaveLength(3);
  });
});
