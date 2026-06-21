import { describe, it, expect } from 'vitest';
import type { ColumnSchema } from '@/types/dataset';
import {
  initColumnView,
  moveColumn,
  reconcileColumnView,
  toggleColumn,
  visibleColumns,
} from './columnView';

const cols: ColumnSchema[] = [
  { name: 'A', key: 'a', type: 'string' },
  { name: 'B', key: 'b', type: 'number' },
  { name: 'C', key: 'c', type: 'string' },
];
const byKey = new Map(cols.map((c) => [c.key, c]));

describe('columnView', () => {
  it('initialises all columns visible in order', () => {
    expect(initColumnView(cols)).toEqual([
      { key: 'a', visible: true },
      { key: 'b', visible: true },
      { key: 'c', visible: true },
    ]);
  });

  it('toggles a single column without touching others', () => {
    const v = toggleColumn(initColumnView(cols), 'b');
    expect(v.map((i) => i.visible)).toEqual([true, false, true]);
  });

  it('moves a column up/down and no-ops at the ends', () => {
    const v = initColumnView(cols);
    expect(moveColumn(v, 'c', 'up').map((i) => i.key)).toEqual(['a', 'c', 'b']);
    expect(moveColumn(v, 'a', 'up')).toEqual(v); // already first
    expect(moveColumn(v, 'c', 'down')).toEqual(v); // already last
  });

  it('returns only visible columns, in view order', () => {
    let v = initColumnView(cols);
    v = toggleColumn(v, 'b'); // hide b
    v = moveColumn(v, 'c', 'up'); // a, c, b
    expect(visibleColumns(v, byKey).map((c) => c.key)).toEqual(['a', 'c']);
  });

  it('reconciles a saved view: keeps known, drops unknown, appends new', () => {
    const saved = [
      { key: 'c', visible: false },
      { key: 'a', visible: true },
      { key: 'gone', visible: true }, // no longer in schema
    ];
    // 'b' is a new column not in the saved view.
    expect(reconcileColumnView(saved, cols)).toEqual([
      { key: 'c', visible: false },
      { key: 'a', visible: true },
      { key: 'b', visible: true },
    ]);
  });
});
