import type { CellValue, ColumnType } from '@/types/dataset';
import { formatNumber } from '@/utils/formatNumber';

export interface FormattedCell {
  text: string;
  align: 'left' | 'right';
  /** True for empty/null cells so the UI can render them dimmed. */
  muted: boolean;
}

/**
 * Pure display formatting for a single cell. Kept out of the component so it can
 * be unit-tested and reused (e.g. CSV re-export, chart tooltips).
 */
export function formatCell(value: CellValue, type: ColumnType): FormattedCell {
  if (value == null) return { text: '—', align: 'left', muted: true };

  switch (type) {
    case 'number':
      return {
        text: typeof value === 'number' ? formatNumber(value) : String(value),
        align: 'right',
        muted: false,
      };
    case 'boolean':
      return { text: value ? 'true' : 'false', align: 'left', muted: false };
    default:
      return { text: String(value), align: 'left', muted: false };
  }
}
