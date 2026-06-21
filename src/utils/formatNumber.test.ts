import { describe, it, expect } from 'vitest';
import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  it('groups thousands with en-US separators regardless of host locale', () => {
    expect(formatNumber(1203)).toBe('1,203');
    expect(formatNumber(2400000)).toBe('2,400,000');
  });

  it('rounds to at most two fraction digits by default', () => {
    expect(formatNumber(309.4666)).toBe('309.47');
    expect(formatNumber(42)).toBe('42');
  });

  it('honours a custom fraction-digit limit', () => {
    expect(formatNumber(3.14159, 0)).toBe('3');
  });

  it('renders non-finite values as an em dash', () => {
    expect(formatNumber(Infinity)).toBe('—');
    expect(formatNumber(NaN)).toBe('—');
  });
});
