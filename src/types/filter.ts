import type { ColumnType } from './dataset';

export type FilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'isTrue'
  | 'isFalse'
  | 'isEmpty'
  | 'isNotEmpty';

export interface ColumnFilter {
  /** Stable unique id for React keys & updates. */
  id: string;
  columnKey: string;
  operator: FilterOperator;
  /** Primary operand as raw text (parsed per column type at evaluation). */
  value: string;
  /** Second operand, used only by the `between` operator. */
  value2?: string;
}

export interface OperatorMeta {
  value: FilterOperator;
  label: string;
  /** Number of operands the operator needs (0 = unary, 2 = range). */
  arity: 0 | 1 | 2;
  /** Column types this operator is offered for. */
  types: ColumnType[];
}
