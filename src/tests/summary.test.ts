import { describe, expect, it } from 'vitest'
import {
  filterMonthTransactionsByType,
  getAvailableStatYears,
  groupMonthTransactionsByDay,
  summarizeExpenseCategories,
  summarizeMonth,
  summarizeYear,
  summarizeYearMonths
} from '../domain/summary'
import type { Transaction } from '../domain/transaction'

describe('summarizeMonth', () => {
  it('summarizes income, expense, and balance for a month', () => {
    const transactions: Transaction[] = [
      makeTransaction({ type: 'income', amount: 1000, occurredAt: '2026-06-01T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 120, occurredAt: '2026-06-02T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 80, occurredAt: '2026-05-02T10:00:00.000Z' })
    ]

    expect(summarizeMonth(transactions, '2026-06')).toEqual({
      income: 1000,
      expense: 120,
      balance: 880
    })
  })

})

describe('summarizeExpenseCategories', () => {
  it('summarizes expense categories for a month', () => {
    const transactions: Transaction[] = [
      makeTransaction({ type: 'expense', amount: 120, category: '餐饮', occurredAt: '2026-06-02T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 80, category: '餐饮', occurredAt: '2026-06-03T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 20, category: '交通', occurredAt: '2026-06-04T10:00:00.000Z' }),
      makeTransaction({ type: 'income', amount: 1000, category: '工资', occurredAt: '2026-06-05T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 50, category: '餐饮', occurredAt: '2026-05-05T10:00:00.000Z' })
    ]

    expect(summarizeExpenseCategories(transactions, '2026-06')).toEqual([
      { category: '餐饮', amount: 200 },
      { category: '交通', amount: 20 }
    ])
  })
})

describe('filterMonthTransactionsByType', () => {
  it('returns only transactions for the requested month and type', () => {
    const transactions: Transaction[] = [
      makeTransaction({ id: 'expense-1', type: 'expense', occurredAt: '2026-06-02T10:00:00.000Z' }),
      makeTransaction({ id: 'income-1', type: 'income', occurredAt: '2026-06-03T10:00:00.000Z' }),
      makeTransaction({ id: 'expense-2', type: 'expense', occurredAt: '2026-05-02T10:00:00.000Z' })
    ]

    expect(filterMonthTransactionsByType(transactions, '2026-06', 'expense').map((transaction) => transaction.id)).toEqual(['expense-1'])
    expect(filterMonthTransactionsByType(transactions, '2026-06', 'income').map((transaction) => transaction.id)).toEqual(['income-1'])
  })
})

describe('summarizeYear', () => {
  it('summarizes income, expense, and balance for a year', () => {
    const transactions: Transaction[] = [
      makeTransaction({ type: 'income', amount: 1000, occurredAt: '2026-06-01T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 120, occurredAt: '2026-06-02T10:00:00.000Z' }),
      makeTransaction({ type: 'income', amount: 500, occurredAt: '2026-05-02T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 80, occurredAt: '2025-05-02T10:00:00.000Z' })
    ]

    expect(summarizeYear(transactions, '2026')).toEqual({
      income: 1500,
      expense: 120,
      balance: 1380
    })
  })
})

describe('summarizeYearMonths', () => {
  it('returns months in descending order from the oldest transaction month by default', () => {
    const transactions: Transaction[] = [
      makeTransaction({ type: 'income', amount: 1000, occurredAt: '2026-06-01T10:00:00.000Z' }),
      makeTransaction({ type: 'expense', amount: 120, occurredAt: '2026-06-02T10:00:00.000Z' }),
      makeTransaction({ type: 'income', amount: 500, occurredAt: '2026-05-02T10:00:00.000Z' })
    ]

    const rows = summarizeYearMonths(transactions, '2026')

    expect(rows).toHaveLength(8)
    expect(rows[0]).toEqual({ month: '2026-12', label: '12月', income: 0, expense: 0, balance: 0 })
    expect(rows[6]).toEqual({ month: '2026-06', label: '6月', income: 1000, expense: 120, balance: 880 })
    expect(rows[7]).toEqual({ month: '2026-05', label: '5月', income: 500, expense: 0, balance: 500 })
  })

  it('starts from the oldest transaction month for the oldest year', () => {
    const transactions: Transaction[] = [
      makeTransaction({ type: 'expense', amount: 100, occurredAt: '2026-05-10T10:00:00.000Z' }),
      makeTransaction({ type: 'income', amount: 1000, occurredAt: '2026-06-10T10:00:00.000Z' })
    ]

    expect(summarizeYearMonths(transactions, '2026', '2026-12').map((row) => row.month)).toEqual([
      '2026-12',
      '2026-11',
      '2026-10',
      '2026-09',
      '2026-08',
      '2026-07',
      '2026-06',
      '2026-05'
    ])
  })

  it('ends at the current month for the current year', () => {
    const transactions: Transaction[] = [
      makeTransaction({ type: 'expense', amount: 100, occurredAt: '2026-01-10T10:00:00.000Z' })
    ]

    expect(summarizeYearMonths(transactions, '2026', '2026-06').map((row) => row.month)).toEqual([
      '2026-06',
      '2026-05',
      '2026-04',
      '2026-03',
      '2026-02',
      '2026-01'
    ])
  })
})

describe('getAvailableStatYears', () => {
  it('returns years from current month year down to the oldest transaction year', () => {
    const transactions: Transaction[] = [
      makeTransaction({ occurredAt: '2024-05-10T10:00:00.000Z' }),
      makeTransaction({ occurredAt: '2025-08-10T10:00:00.000Z' })
    ]

    expect(getAvailableStatYears(transactions, '2026-06')).toEqual(['2026', '2025', '2024'])
  })

  it('returns the current year when there are no transactions', () => {
    expect(getAvailableStatYears([], '2026-06')).toEqual(['2026'])
  })
})

describe('groupMonthTransactionsByDay', () => {
  it('groups transactions for a month by day in descending order', () => {
    const transactions: Transaction[] = [
      makeTransaction({ id: 't1', type: 'expense', amount: 20, occurredAt: '2026-06-25T08:00:00.000Z' }),
      makeTransaction({ id: 't2', type: 'income', amount: 100, occurredAt: '2026-06-25T09:00:00.000Z' }),
      makeTransaction({ id: 't3', type: 'expense', amount: 8, occurredAt: '2026-06-24T09:00:00.000Z' }),
      makeTransaction({ id: 't4', type: 'expense', amount: 9, occurredAt: '2026-05-24T09:00:00.000Z' })
    ]

    const groups = groupMonthTransactionsByDay(transactions, '2026-06')

    expect(groups).toHaveLength(2)
    expect(groups[0].date).toBe('2026-06-25')
    expect(groups[0].label).toBe('6月25日')
    expect(groups[0].transactions.map((transaction) => transaction.id)).toEqual(['t2', 't1'])
    expect(groups[1].date).toBe('2026-06-24')
    expect(groups[1].transactions.map((transaction) => transaction.id)).toEqual(['t3'])
  })
})

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    type: 'expense',
    amount: 1,
    category: '餐饮',
    note: '',
    occurredAt: '2026-06-01T10:00:00.000Z',
    ...overrides
  }
}
