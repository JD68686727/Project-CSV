import { useCallback, useReducer, useRef } from 'react';
import Papa, { type ParseResult, type Parser } from 'papaparse';
import type {
  CellValue,
  ColumnSchema,
  Dataset,
  LogRow,
  ParseError,
  ParseState,
} from '@/types/dataset';
import { inferSchema } from '@/lib/csv/inferSchema';

// --- Configuration ----------------------------------------------------------

const MAX_ROWS = 500_000; // hard cap to protect the browser's memory
const SCHEMA_SAMPLE_SIZE = 50;

// --- State machine ----------------------------------------------------------

type Action =
  | { type: 'START' }
  | { type: 'PROGRESS'; progress: number }
  | { type: 'SUCCESS'; dataset: Dataset; errors: ParseError[] }
  | { type: 'ERROR'; errors: ParseError[] }
  | { type: 'RESET' };

const initialState: ParseState = {
  status: 'idle',
  dataset: null,
  errors: [],
  progress: 0,
};

function reducer(state: ParseState, action: Action): ParseState {
  switch (action.type) {
    case 'START':
      return { ...initialState, status: 'parsing' };
    case 'PROGRESS':
      return { ...state, progress: action.progress };
    case 'SUCCESS':
      return {
        status: 'success',
        dataset: action.dataset,
        errors: action.errors,
        progress: 100,
      };
    case 'ERROR':
      return { ...state, status: 'error', errors: action.errors, progress: 0 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// --- Helpers ----------------------------------------------------------------

/** Coerces a raw string cell to a typed CellValue based on the column schema. */
function coerce(raw: string | undefined, column: ColumnSchema): CellValue {
  if (raw == null || raw === '') return null;
  switch (column.type) {
    case 'number': {
      const n = Number(raw);
      return Number.isNaN(n) ? raw : n;
    }
    case 'boolean': {
      const v = raw.toLowerCase();
      if (v === 'true' || v === 'yes') return true;
      if (v === 'false' || v === 'no') return false;
      return raw;
    }
    default:
      // Keep strings & dates as raw strings; parse lazily downstream.
      return raw;
  }
}

function buildColumnIndex(columns: ColumnSchema[]): Record<string, number> {
  const index: Record<string, number> = {};
  columns.forEach((c, i) => {
    index[c.key] = i;
  });
  return index;
}

// --- Hook -------------------------------------------------------------------

export interface UseLogParser extends ParseState {
  parseFile: (file: File) => void;
  reset: () => void;
}

export function useLogParser(): UseLogParser {
  const [state, dispatch] = useReducer(reducer, initialState);

  // A token that invalidates an in-flight parse when a new file arrives.
  const runIdRef = useRef(0);

  const parseFile = useCallback((file: File) => {
    const runId = ++runIdRef.current;
    const isStale = () => runId !== runIdRef.current;

    dispatch({ type: 'START' });

    // Accumulators live in closures, NOT in React state, so the thousands of
    // streamed chunks never trigger a re-render. We commit once at the end.
    const rawRows: string[][] = [];
    const errors: ParseError[] = [];
    let headers: string[] = [];
    let detectedDelimiter = '';
    let truncated = false;

    Papa.parse<string[]>(file, {
      worker: true, // offload parsing to a Web Worker → UI stays responsive
      skipEmptyLines: 'greedy',
      delimiter: '', // let PapaParse auto-detect
      // We don't use `header: true` because we want full control over header
      // normalization and to keep rows as flat arrays for memory efficiency.

      chunk: (results: ParseResult<string[]>, parser: Parser) => {
        if (isStale()) {
          parser.abort();
          return;
        }

        if (!detectedDelimiter && results.meta.delimiter) {
          detectedDelimiter = results.meta.delimiter;
        }

        const data = results.data;
        let startIdx = 0;

        // First non-empty row of the whole file is the header.
        if (headers.length === 0 && data.length > 0) {
          headers = data[0];
          startIdx = 1;
        }

        for (let i = startIdx; i < data.length; i++) {
          if (rawRows.length >= MAX_ROWS) {
            truncated = true;
            parser.abort();
            break;
          }
          rawRows.push(data[i]);
        }

        for (const err of results.errors) {
          errors.push({
            code: err.code ?? 'PARSE_ERROR',
            message: err.message,
            row: err.row,
          });
        }

        // Progress is best-effort: PapaParse exposes cursor (bytes read).
        const cursor = results.meta.cursor ?? 0;
        if (file.size > 0) {
          const progress = Math.min(99, Math.round((cursor / file.size) * 100));
          dispatch({ type: 'PROGRESS', progress });
        }
      },

      complete: () => {
        if (isStale()) return;

        if (headers.length === 0) {
          dispatch({
            type: 'ERROR',
            errors: [
              {
                code: 'EMPTY_FILE',
                message: 'The file appears to be empty or has no header row.',
              },
            ],
          });
          return;
        }

        const columns = inferSchema(headers, rawRows, SCHEMA_SAMPLE_SIZE);
        const columnIndex = buildColumnIndex(columns);

        // Single typed-coercion pass. Pre-allocating the rows array avoids
        // repeated reallocation as it grows.
        const rows: LogRow[] = new Array(rawRows.length);
        for (let r = 0; r < rawRows.length; r++) {
          const raw = rawRows[r];
          const row: LogRow = new Array(columns.length);
          for (let c = 0; c < columns.length; c++) {
            row[c] = coerce(raw[c], columns[c]);
          }
          rows[r] = row;
        }

        const dataset: Dataset = {
          columns,
          rows,
          columnIndex,
          meta: {
            fileName: file.name,
            fileSize: file.size,
            rowCount: rows.length,
            delimiter: detectedDelimiter || ',',
            truncated,
          },
        };

        dispatch({ type: 'SUCCESS', dataset, errors });
      },

      error: (err: Error) => {
        if (isStale()) return;
        dispatch({
          type: 'ERROR',
          errors: [{ code: 'FATAL', message: err.message }],
        });
      },
    });
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++; // invalidate any in-flight parse
    dispatch({ type: 'RESET' });
  }, []);

  return { ...state, parseFile, reset };
}
