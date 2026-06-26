export function createBackupFileName(extension: 'json' | 'xlsx', date = new Date()): string {
  const iso = date.toISOString()
  const datePart = iso.slice(0, 10)
  const timePart = iso.slice(11, 19).replace(/:/g, '')

  return `accounting-book-${datePart}-${timePart}.${extension}`
}
