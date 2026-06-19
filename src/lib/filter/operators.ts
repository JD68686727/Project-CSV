import type { ColumnType } from '@/types/dataset';
import type { FilterOperator, OperatorMeta } from '@/types/filter';

/** Catalogue of every filter operator and the column types it applies to. */
export const OPERATORS: OperatorMeta[] = [
  { value: 'contains', label: 'contains', arity: 1, types: ['string', 'date'] },
  { value: 'notContains', label: 'does not contain', arity: 1, types: ['string', 'date'] },
  { value: 'equals', label: '=', arity: 1, types: ['string', 'number', 'date'] },
  { value: 'notEquals', label: '≠', arity: 1, types: ['string', 'number', 'date'] },
  { value: 'gt', label: '>', arity: 1, types: ['number', 'date'] },
  { value: 'gte', label: '≥', arity: 1, types: ['number', 'date'] },
  { value: 'lt', label: '<', arity: 1, types: ['number', 'date'] },
  { value: 'lte', label: '≤', arity: 1, types: ['number', 'date'] },
  { value: 'between', label: 'between', arity: 2, types: ['number', 'date'] },
  { value: 'isTrue', label: 'is true', arity: 0, types: ['boolean'] },
  { value: 'isFalse', label: 'is false', arity: 0, types: ['boolean'] },
  {
    value: 'isEmpty',
    label: 'is empty',
    arity: 0,
    types: ['string', 'number', 'boolean', 'date'],
  },
  {
    value: 'isNotEmpty',
    label: 'is not empty',
    arity: 0,
    types: ['string', 'number', 'boolean', 'date'],
  },
];

const BY_VALUE = new Map<FilterOperator, OperatorMeta>(
  OPERATORS.map((op) => [op.value, op]),
);

export function getOperator(value: FilterOperator): OperatorMeta | undefined {
  return BY_VALUE.get(value);
}

export function operatorsForType(type: ColumnType): OperatorMeta[] {
  return OPERATORS.filter((op) => op.types.includes(type));
}
