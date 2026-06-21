import { useCallback, useState } from 'react';
import type { Dataset } from '@/types/dataset';
import type { LoadedFile } from '@/types/workspace';

let idCounter = 0;
const nextId = () => `file-${Date.now()}-${++idCounter}`;

export interface UseWorkspace {
  files: LoadedFile[];
  activeFile: LoadedFile | null;
  addDataset: (dataset: Dataset) => void;
  removeFile: (id: string) => void;
  setActive: (id: string) => void;
}

/** Holds the collection of loaded files and which one is active in Analyze mode. */
export function useWorkspace(): UseWorkspace {
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addDataset = useCallback((dataset: Dataset) => {
    const file: LoadedFile = { id: nextId(), dataset };
    setFiles((prev) => [...prev, file]);
    setActiveId(file.id); // a newly loaded file becomes active
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const setActive = useCallback((id: string) => setActiveId(id), []);

  // Derive the active file with a fallback so removing the active one (which
  // leaves `activeId` stale) still resolves to a valid file.
  const activeFile =
    files.find((f) => f.id === activeId) ?? files[files.length - 1] ?? null;

  return { files, activeFile, addDataset, removeFile, setActive };
}
