/**
 * Triggers a client-side file download from in-memory content. Pure browser
 * side-effect — keeps the File/Blob plumbing out of components. Stays true to
 * the local-first model: nothing is uploaded anywhere.
 */
export function downloadBlob(
  filename: string,
  content: string | Blob,
  mime = 'text/csv;charset=utf-8',
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
