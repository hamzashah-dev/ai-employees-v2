/**
 * A pack's compressed size, for the caption shown while a hire uploads.
 *
 * Whole kilobytes below a megabyte and one decimal above it: these archives run
 * from about 6 KB to a few hundred, and "0.1 MB" tells a user less than "71 KB"
 * about how long they are waiting.
 */
export function formatPackSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${Math.round(bytes / 1_024)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}
