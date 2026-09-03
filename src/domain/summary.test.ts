import { describe, expect, it } from 'vitest'
import type { Transaction } from './transaction'
import { groupMonthTransactionsByDay } from './summary'

function transaction(id: string, occurredAt: string): Transaction {
  return { id, type: 'expense', amount: 1, category: '其他', note: '', occurredAt, includeInBudget: true }
}

describe('groupMonthTransactionsByDay', () => {
  it('同一天内按时分秒倒序排列新旧格式账单', () => {
    const groups = groupMonthTransactionsByDay([
      transaction('legacy', '2026-09-02T23:59:59+08:00'),
      transaction('newer', '2026-09-02 18:30:00'),
      transaction('newest', '2026-09-02 20:15:10')
    ], '2026-09')

    expect(groups[0].transactions.map(({ id }) => id)).toEqual(['newest', 'newer', 'legacy'])
  })
})
