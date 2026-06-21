import { describe, it, expect } from 'vitest';
import { bucketDate } from './dateBucket';

const ts = '2026-06-19T08:01:12'; // a Friday

describe('bucketDate', () => {
  it('buckets to hour/day/month with zero-padded labels', () => {
    expect(bucketDate(ts, 'hour')).toBe('2026-06-19 08:00');
    expect(bucketDate(ts, 'day')).toBe('2026-06-19');
    expect(bucketDate(ts, 'month')).toBe('2026-06');
  });

  it('anchors weeks to the preceding Monday', () => {
    expect(bucketDate(ts, 'week')).toBe('2026-06-15'); // Mon of that week
  });

  it('returns the raw value for none or unparseable input', () => {
    expect(bucketDate(ts, 'none')).toBe(ts);
    expect(bucketDate('not-a-date', 'day')).toBe('not-a-date');
  });

  it('produces chronologically sortable labels', () => {
    const labels = ['2026-06-19T23:30', '2026-06-20T00:15', '2026-06-19T09:00'].map(
      (s) => bucketDate(s, 'hour'),
    );
    expect([...labels].sort()).toEqual([
      '2026-06-19 09:00',
      '2026-06-19 23:00',
      '2026-06-20 00:00',
    ]);
  });
});
