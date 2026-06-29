import { useCallback, useMemo, useState } from 'react';
import type { ColumnSchema, ColumnType, Dataset } from '@/types/dataset';
import type { ColumnViewItem } from '@/types/table';
import {
  initColumnView,
  moveColumn,
  reconcileColumnView,
  toggleColumn,
  visibleColumns,
} from '@/lib/table/columnView';

export interface ColumnManagerItem {
  key: string;
  name: string;
  visible: boolean;
  type: ColumnType;
}

export interface UseColumnView {
  /** Raw ordered view state (for persisting in presets). */
  view: ColumnViewItem[];
  /** View joined with column names, for the manager UI. */
  items: ColumnManagerItem[];
  /** Visible columns as ordered schemas, for the table & export. */
  visible: ColumnSchema[];
  toggle: (key: string) => void;
  move: (key: string, dir: 'up' | 'down') => void;
  showAll: () => void;
  reset: () => void;
  /** Restore a persisted view (reconciled against the current schema). */
  applyView: (saved: ColumnViewItem[]) => void;
}

export function useColumnView(dataset: Dataset): UseColumnView {
  const [view, setView] = useState<ColumnViewItem[]>(() =>
    initColumnView(dataset.columns),
  );

  const byKey = useMemo(
    () => new Map(dataset.columns.map((c) => [c.key, c])),
    [dataset],
  );

  const visible = useMemo(() => visibleColumns(view, byKey), [view, byKey]);

  const items = useMemo<ColumnManagerItem[]>(
    () =>
      view.map((i) => ({
        key: i.key,
        name: byKey.get(i.key)?.name ?? i.key,
        visible: i.visible,
        type: byKey.get(i.key)?.type ?? 'string',
      })),
    [view, byKey],
  );

  const toggle = useCallback((key: string) => {
    setView((v) => {
      const item = v.find((i) => i.key === key);
      const visibleCount = v.filter((i) => i.visible).length;
      // Always keep at least one column visible.
      if (item?.visible && visibleCount <= 1) return v;
      return toggleColumn(v, key);
    });
  }, []);

  const move = useCallback(
    (key: string, dir: 'up' | 'down') => setView((v) => moveColumn(v, key, dir)),
    [],
  );

  const showAll = useCallback(
    () => setView((v) => v.map((i) => ({ ...i, visible: true }))),
    [],
  );

  const reset = useCallback(
    () => setView(initColumnView(dataset.columns)),
    [dataset],
  );

  const applyView = useCallback(
    (saved: ColumnViewItem[]) =>
      setView(reconcileColumnView(saved, dataset.columns)),
    [dataset],
  );

  return { view, items, visible, toggle, move, showAll, reset, applyView };
}
