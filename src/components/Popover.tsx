import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PopoverProps {
  /** Element the panel is positioned beneath and right-aligned to. */
  anchor: HTMLElement;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A lightweight floating panel rendered in a portal so it escapes the stats
 * panel's `overflow` clipping. Positioned below its anchor and right-aligned to
 * it (clamped into the viewport). Closes on outside click, Escape, or any
 * scroll/resize — cheaper and steadier than re-tracking the anchor on scroll.
 */
export function Popover({ anchor, onClose, children }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const a = anchor.getBoundingClientRect();
    const width = panel.offsetWidth;
    const left = Math.max(
      8,
      Math.min(a.right - width, window.innerWidth - width - 8),
    );
    setPos({ top: a.bottom + 6, left });
  }, [anchor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !anchor.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      style={{
        position: 'fixed',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className="z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      {children}
    </div>,
    document.body,
  );
}
