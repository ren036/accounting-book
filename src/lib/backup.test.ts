import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from './backup'

describe('JSON backup', () => {
  it('保留储蓄和初始可支配余额', () => {
    const data = {
      transactions: [],
      savingsBuckets: [{ id: 'goal', kind: 'goal' as const, name: '旅行', targetAmount: 5000, targetDate: null, createdAt: '2026-09-01', status: 'active' as const }],
      savingsMovements: [{ id: 'movement', bucketId: 'goal', type: 'deposit' as const, amount: 500, occurredAt: '2026-09-02 10:00:00', note: '' }],
      openingDisposableBalance: 1000
    }

    expect(parseBackup(serializeBackup(data))).toEqual(data)
  })

  it('仍能导入旧版备份', () => {
    const parsed = parseBackup(JSON.stringify({ version: 1, exportedAt: '', transactions: [] }))
    expect(parsed).toEqual({ transactions: [], savingsBuckets: [], savingsMovements: [], openingDisposableBalance: 0 })
  })

  it('旧的已归档状态迁移为存钱中并移除关联字段', () => {
    const parsed = parseBackup(JSON.stringify({
      version: 2,
      exportedAt: '',
      transactions: [{ id: 'expense', type: 'expense', amount: 10, category: '其他', note: '', occurredAt: '2026-09-01', includeInBudget: true, savingsMovementId: 'movement' }],
      savingsBuckets: [{ id: 'goal', kind: 'goal', name: '旧目标', targetAmount: 10, targetDate: null, createdAt: '', status: 'archived' }],
      savingsMovements: [{ id: 'movement', bucketId: 'goal', type: 'withdrawal', amount: 10, occurredAt: '2026-09-01', note: '', linkedTransactionId: 'expense' }],
      openingDisposableBalance: 0
    }))
    expect(parsed.transactions[0]).not.toHaveProperty('savingsMovementId')
    expect(parsed.savingsMovements[0]).not.toHaveProperty('linkedTransactionId')
    expect(parsed.savingsBuckets[0].status).toBe('active')
  })

})
