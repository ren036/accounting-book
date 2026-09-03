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
      savingsBuckets: [],
      savingsMovements: [],
      openingDisposableBalance: 0,
      includesSavingsData: true,
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
      savingsBuckets: [],
      savingsMovements: [],
      openingDisposableBalance: 0,
      includesSavingsData: true,
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
      savingsBuckets: [],
      savingsMovements: [],
      openingDisposableBalance: 0,
      includesSavingsData: true,
      skipped: 0
    })
  })

  it('完整导出并恢复储蓄数据', () => {
    const buckets = [{ id: 'goal', kind: 'goal' as const, name: '旅行', targetAmount: 5000, targetDate: '2026-12-31', createdAt: '2026-09-01', status: 'active' as const }]
    const movements = [{ id: 'move', bucketId: 'goal', type: 'deposit' as const, amount: 300, occurredAt: '2026-09-02 10:00:00', note: '首笔' }]
    const parsed = parseExcelBackup(serializeExcelBackup([], buckets, movements, 1200))
    expect(parsed).toMatchObject({ savingsBuckets: buckets, savingsMovements: movements, openingDisposableBalance: 1200, includesSavingsData: true })
  })

})
