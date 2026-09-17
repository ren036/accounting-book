import { formatLocalDateTime } from './dates'

export function createBackupFileName(extension: 'json' | 'xlsx', date = new Date()): string {
  const [datePart, timePart] = formatLocalDateTime(date).split(' ')

  return `accounting-book-${datePart}-${timePart.replace(/:/g, '')}.${extension}`
}
