import type { ViewState } from '@/types/share';

/** URL-safe base64 of a UTF-8 string (browser-native, no deps). */
function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Serializes a view to a compact, URL-safe token. */
export function encodeView(view: ViewState): string {
  return toBase64Url(JSON.stringify(view));
}

/** Minimal structural validation so a hand-edited/garbage token degrades to null. */
function isViewState(value: unknown): value is ViewState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.filters) &&
    typeof v.query === 'string' &&
    typeof v.chart === 'object' &&
    v.chart !== null &&
    Array.isArray(v.columns) &&
    (v.sort === null || typeof v.sort === 'object')
  );
}

/** Parses a token back to a ViewState, or null if it's malformed. */
export function decodeView(token: string): ViewState | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(token));
    return isViewState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
