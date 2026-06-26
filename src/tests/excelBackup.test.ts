import { describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import type { Transaction } from '../domain/transaction'
import { parseExcelBackup, parseReadableTransactionsSheet, serializeExcelBackup } from '../lib/excelBackup'

const transactions: Transaction[] = [
  {
    id: 't1',
    type: 'expense',
    amount: 12.5,
    category: '餐饮',
    note: '午饭',
    occurredAt: '2026-06-01T00:00:00.000Z'
  },
  {
    id: 't2',
    type: 'income',
    amount: 3000,
    category: '工资',
    note: '六月工资',
    occurredAt: '2026-06-02T00:00:00.000Z'
  }
]

describe('excelBackup', () => {
  it('serializes transactions as visible worksheet rows', () => {
    const buffer = serializeExcelBackup(transactions)
    const workbook = XLSX.read(buffer, { type: 'array' })
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets.Transactions, { header: 1, raw: true })

    expect(rows).toEqual([
      ['id', 'type', 'amount', 'category', 'note', 'occurredAt'],
      ['t1', 'expense', 12.5, '餐饮', '午饭', '2026-06-01T00:00:00.000Z'],
      ['t2', 'income', 3000, '工资', '六月工资', '2026-06-02T00:00:00.000Z']
    ])
  })

  it('parses exported transaction worksheet rows and preserves ids', () => {
    const buffer = serializeExcelBackup(transactions)

    expect(parseExcelBackup(buffer)).toEqual({ skipped: 0, transactions })
  })

  it('skips invalid exported transaction worksheet rows', () => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['id', 'type', 'amount', 'category', 'note', 'occurredAt'],
      ['valid-id', 'expense', 12.5, '餐饮', '午饭', '2026-06-01T00:00:00.000Z'],
      ['bad-date', 'expense', 12.5, '餐饮', '午饭', 'not-a-date'],
      ['', 'income', 3000, '工资', '六月工资', '2026-06-02T00:00:00.000Z']
    ])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseExcelBackup(buffer)).toEqual({
      skipped: 2,
      transactions: [
        {
          id: 'valid-id',
          type: 'expense',
          amount: 12.5,
          category: '餐饮',
          note: '午饭',
          occurredAt: '2026-06-01T00:00:00.000Z'
        }
      ]
    })
  })

  it('imports readable Transactions sheet rows', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000101')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000102')

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['日期', '类型', '金额', '分类', '备注'],
      ['2026-06-01', '支出', 12.5, '餐饮', '午饭'],
      ['2026-06-02', '收入', '3000', '工资', '六月工资'],
      ['not-a-date', '支出', 10, '其他', '无效日期']
    ])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseReadableTransactionsSheet(buffer)).toEqual({
      skipped: 1,
      transactions: [
        {
          id: '00000000-0000-4000-8000-000000000101',
          type: 'expense',
          amount: 12.5,
          category: '餐饮',
          note: '午饭',
          occurredAt: '2026-06-01T00:00:00.000Z'
        },
        {
          id: '00000000-0000-4000-8000-000000000102',
          type: 'income',
          amount: 3000,
          category: '工资',
          note: '六月工资',
          occurredAt: '2026-06-02T00:00:00.000Z'
        }
      ]
    })
  })

  it('returns null when no exported Transactions sheet exists', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['version', 1]]), 'Backup')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseExcelBackup(buffer)).toBeNull()
  })

  it('returns null when no readable Transactions sheet exists', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['version', 1]]), 'Backup')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseReadableTransactionsSheet(buffer)).toBeNull()
  })
})
