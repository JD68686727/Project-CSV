import type { CellValue, ColumnSchema, ColumnType } from './dataset';

/** Column-level delta from a baseline file (A) to a comparison file (B). */
export interface SchemaDiff {
  /** Columns present in B but not A. */
  added: ColumnSchema[];
  /** Columns present in A but not B. */
  removed: ColumnSchema[];
  /** Shared columns whose inferred type differs. */
  typeChanged: { key: string; name: string; from: ColumnType; to: ColumnType }[];
  /** Shared columns with the same inferred type. */
  unchanged: ColumnSchema[];
}

export interface FieldChange {
  key: string;
  name: string;
  from: CellValue;
  to: CellValue;
}

export interface ChangedRow {
  key: string;
  changes: FieldChange[];
}

/** Row-level delta keyed by a chosen column, over the files' shared columns. */
export interface RowDiff {
  keyName: string;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  /** First N changed rows, with the fields that differ. */
  changedSample: ChangedRow[];
  addedSample: string[];
  removedSample: string[];
  /** A or B had repeated key values → the match is approximate. */
  duplicateKeys: boolean;
}
