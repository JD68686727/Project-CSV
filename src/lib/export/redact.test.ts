import { describe, it, expect } from 'vitest';
import { makeCellRedactor } from './redact';

const ALL = ['email', 'mac', 'ipv6', 'ipv4'];

describe('makeCellRedactor', () => {
  it('replaces matches with a fixed token in token mode', () => {
    const r = makeCellRedactor(['ipv4'], 'token');
    expect(r('from 10.0.0.4 to 10.0.0.9')).toBe('from [IP] to [IP]');
  });

  it('maps each distinct value to a stable dummy in consistent mode', () => {
    const r = makeCellRedactor(['ipv4'], 'consistent');
    expect(r('10.0.0.4')).toBe('[IP_1]');
    expect(r('10.0.0.9')).toBe('[IP_2]');
    expect(r('10.0.0.4 again')).toBe('[IP_1] again'); // same value → same dummy
  });

  it('redacts e-mails and MACs', () => {
    const r = makeCellRedactor(ALL, 'token');
    expect(r('ops@example.com')).toBe('[EMAIL]');
    expect(r('00:1A:2B:3C:4D:5E')).toBe('[MAC]');
  });

  it('redacts a MAC as MAC, not as IPv6 (precedence)', () => {
    const r = makeCellRedactor(['mac', 'ipv6'], 'token');
    expect(r('00:1A:2B:3C:4D:5E')).toBe('[MAC]');
  });

  it('only redacts enabled categories and leaves non-strings untouched', () => {
    const r = makeCellRedactor(['email'], 'token');
    expect(r('10.0.0.4 ops@example.com')).toBe('10.0.0.4 [EMAIL]');
    expect(r(200)).toBe(200);
    expect(r(null)).toBeNull();
  });
});
