import { useEffect, useRef, useState } from 'react';
import type { ColumnManagerItem } from '../hooks/useColumnView';

export interface ColumnManagerProps {
  items: ColumnManagerItem[];
  onToggle: (key: string) => void;
  onMove: (key: string, dir: 'up' | 'down') => void;
  onShowAll: () => void;
  onReset: () => void;
}

export function ColumnManager({
  items,
  onToggle,
  onMove,
  onShowAll,
  onReset,
}: ColumnManagerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const visibleCount = items.filter((i) => i.visible).length;
  const lastVisible = visibleCount <= 1;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Columns
        <span className="text-xs text-slate-400">
          {visibleCount}/{items.length}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="max-h-72 overflow-auto">
            {items.map((item, idx) => (
              <div
                key={item.key}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50"
              >
                <label className="flex flex-1 items-center gap-2 truncate text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    disabled={item.visible && lastVisible}
                    onChange={() => onToggle(item.key)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30 disabled:opacity-40"
                  />
                  <span className="truncate">{item.name}</span>
                </label>
                <button
                  type="button"
                  onClick={() => onMove(item.key, 'up')}
                  disabled={idx === 0}
                  aria-label={`Move ${item.name} up`}
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMove(item.key, 'down')}
                  disabled={idx === items.length - 1}
                  aria-label={`Move ${item.name} down`}
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ↓
                </button>
              </div>
            ))}
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-slate-100 px-2 pt-2">
            <button
              type="button"
              onClick={onShowAll}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Show all
            </button>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Reset order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
