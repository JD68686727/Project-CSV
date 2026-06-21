import { describe, it, expect } from 'vitest';
import { getOperator, operatorsForType } from './operators';

describe('operatorsForType', () => {
  it('offers ordered/range operators for numbers, not text search', () => {
    const ops = operatorsForType('number').map((o) => o.value);
    expect(ops).toContain('gt');
    expect(ops).toContain('between');
    expect(ops).not.toContain('contains');
  });

  it('offers boolean operators only for booleans', () => {
    expect(operatorsForType('boolean').map((o) => o.value)).toEqual(
      expect.arrayContaining(['isTrue', 'isFalse']),
    );
    expect(operatorsForType('string').map((o) => o.value)).not.toContain('isTrue');
  });

  it('offers contains for strings and dates', () => {
    expect(operatorsForType('string').map((o) => o.value)).toContain('contains');
    expect(operatorsForType('date').map((o) => o.value)).toContain('contains');
  });
});

describe('getOperator', () => {
  it('returns arity metadata', () => {
    expect(getOperator('between')?.arity).toBe(2);
    expect(getOperator('isEmpty')?.arity).toBe(0);
    expect(getOperator('contains')?.arity).toBe(1);
  });

  it('returns undefined for an unknown operator', () => {
    // @ts-expect-error testing the runtime guard with an invalid value
    expect(getOperator('nope')).toBeUndefined();
  });
});
