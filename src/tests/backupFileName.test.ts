import { describe, expect, it } from 'vitest'
import { createBackupFileName } from '../lib/backupFileName'

describe('createBackupFileName', () => {
  it('includes date and time to avoid same-day export name collisions', () => {
    expect(createBackupFileName('xlsx', new Date('2026-06-26T11:22:33.456Z'))).toBe(
      'accounting-book-2026-06-26-112233.xlsx'
    )
  })
})
