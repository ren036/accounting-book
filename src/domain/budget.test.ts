import { describe, expect, it } from 'vitest'
import { summarizeBudget } from './budget'
import type { Transaction } from './transaction'

function expense(id: string, amount: number, includeInBudget: boolean, occurredAt = '2026-09-01T00:00:00.000Z'): Transaction {
  return { id, type: 'expense', amount, category: '餐饮', note: '', occurredAt, includeInBudget }
}

describe('summarizeBudget', () => {
  it('只汇总当月且选择计入预算的支出', () => {
    const transactions = [
      expense('included', 300, true),
      expense('excluded', 100, false),
      expense('other-month', 200, true, '2026-08-31T00:00:00.000Z'),
      { ...expense('income', 500, true), type: 'income' as const }
    ]

    expect(summarizeBudget(transactions, { month: '2026-09', amount: 1000 })).toEqual({
      spent: 300,
      remaining: 700,
      percentage: 30
    })
  })

  it('保留超支后的负数剩余金额和超过 100% 的比例', () => {
    expect(summarizeBudget([expense('one', 1200, true)], { month: '2026-09', amount: 1000 })).toEqual({
      spent: 1200,
      remaining: -200,
      percentage: 120
    })
  })
})
