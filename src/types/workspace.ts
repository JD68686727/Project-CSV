import type { Dataset } from './dataset';

/** A parsed file held in the workspace; `id` is stable for the session. */
export interface LoadedFile {
  id: string;
  dataset: Dataset;
}

export type WorkspaceMode = 'analyze' | 'compare';
