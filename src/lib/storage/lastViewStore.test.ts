// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import type { ViewState } from '@/types/share';
import { getLastView, setLastView } from './lastViewStore';

const view = (query: string): ViewState => ({
  groups: [],
  query,
  sort: [],
  chart: {
    type: 'bar',
    dimensionKey: 'a',
    measureKey: null,
    aggregation: 'count',
    bucket: 'none',
  },
  columns: [],
});

beforeEach(() => localStorage.clear());

describe('lastViewStore', () => {
  it('round-trips a view by signature', () => {
    expect(getLastView('sig-a')).toBeNull();
    setLastView('sig-a', view('hello'));
    expect(getLastView('sig-a')?.query).toBe('hello');
  });

  it('keeps views separate per signature and overwrites', () => {
    setLastView('sig-a', view('a1'));
    setLastView('sig-b', view('b1'));
    setLastView('sig-a', view('a2'));
    expect(getLastView('sig-a')?.query).toBe('a2');
    expect(getLastView('sig-b')?.query).toBe('b1');
  });

  it('prunes to the 20 most-recently-saved signatures', () => {
    for (let i = 0; i < 25; i++) setLastView(`sig-${i}`, view(`v${i}`));
    expect(getLastView('sig-0')).toBeNull(); // evicted (oldest)
    expect(getLastView('sig-24')?.query).toBe('v24'); // kept (newest)
  });

  it('degrades to null on corrupt storage', () => {
    localStorage.setItem('logvibe.lastview.v1', '{not json');
    expect(getLastView('sig-a')).toBeNull();
  });
});
