import { useCallback, useState } from 'react';
import type { ViewState } from '@/types/share';
import { decodeView } from '@/lib/share/encodeView';

const HASH_PREFIX = '#v=';

function readHashView(): ViewState | null {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  return decodeView(hash.slice(HASH_PREFIX.length));
}

export interface UseSharedView {
  /** A view decoded from the URL on first load, awaiting a dataset to apply to. */
  pending: ViewState | null;
  /** Mark the pending view as applied and strip it from the URL. */
  consume: () => void;
}

/**
 * Reads a `#v=…` shared view from the URL once on mount. The view can't apply
 * until a file is loaded (it references column keys), so it's held as `pending`
 * and consumed by the workspace after the first dataset mounts.
 */
export function useSharedView(): UseSharedView {
  const [pending, setPending] = useState<ViewState | null>(() => readHashView());

  const consume = useCallback(() => {
    setPending(null);
    // Drop the token from the address bar so a later reload / new file doesn't
    // re-apply a stale view.
    if (window.location.hash.startsWith(HASH_PREFIX)) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return { pending, consume };
}
