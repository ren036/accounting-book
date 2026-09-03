import { describe, expect, it } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { parseExcelBackup, serializeExcelBackup } from './excelBackup'

describe('Excel backup', () => {
  it('可以重新导入使用当前时间格式的导出账单', () => {
    const transactions: Transaction[] = [{
      id: 'local-time',
      type: 'expense',
      amount: 12.34,
      category: '餐饮',
      note: '午餐',
      occurredAt: '2026-09-02 18:24:38',
      includeInBudget: true
    }]

    expect(parseExcelBackup(serializeExcelBackup(transactions))).toEqual({
      transactions,
      skipped: 0
    })
  })

  it('仍兼容带 Z 的旧时间格式', () => {
    const transactions: Transaction[] = [{
      id: 'utc-time',
      type: 'income',
      amount: 100,
      category: '工资',
      note: '',
      occurredAt: '2026-09-01T00:00:00.000Z',
      includeInBudget: false
    }]

    expect(parseExcelBackup(serializeExcelBackup(transactions))).toEqual({
      transactions: [{ ...transactions[0], occurredAt: '2026-09-01' }],
      skipped: 0
    })
  })

  it('兼容带时区偏移的最旧时间格式', () => {
    const transactions: Transaction[] = [{
      id: 'legacy-offset',
      type: 'expense',
      amount: 20,
      category: '交通',
      note: '',
      occurredAt: '2026-08-25T00:00:00+00:00',
      includeInBudget: true
    }]

    expect(parseExcelBackup(serializeExcelBackup(transactions))).toEqual({
      transactions: [{ ...transactions[0], occurredAt: '2026-08-25' }],
      skipped: 0
    })
  })
})
