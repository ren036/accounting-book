import { describe, expect, it } from 'vitest'
import { getTransactionNoteDisplay, searchTransactions, updateTransaction } from '../domain/transaction'

describe('updateTransaction', () => {
  it('keeps identity fields and updates editable fields', () => {
    const original = {
      id: 't1',
      type: 'expense' as const,
      amount: 20,
      category: '餐饮',
      note: '午饭',
      occurredAt: '2026-06-25T00:00:00.000Z'
    }

    expect(
      updateTransaction(original, {
        type: 'income',
        amount: 100,
        category: '工资',
        note: '六月工资',
        occurredAt: '2026-06-26T00:00:00.000Z'
      })
    ).toEqual({
      id: 't1',
      type: 'income',
      amount: 100,
      category: '工资',
      note: '六月工资',
      occurredAt: '2026-06-26T00:00:00.000Z'
    })
  })
})

describe('getTransactionNoteDisplay', () => {
  it('returns trimmed note text and hides empty notes', () => {
    expect(getTransactionNoteDisplay(' 午饭 ')).toBe('午饭')
    expect(getTransactionNoteDisplay('')).toBeNull()
    expect(getTransactionNoteDisplay('   ')).toBeNull()
  })
})

describe('searchTransactions', () => {
  const transactions = [
    {
      id: 'lunch',
      type: 'expense' as const,
      amount: 28.5,
      category: '餐饮',
      note: '同事午饭',
      occurredAt: '2026-06-25T12:00:00.000Z'
    },
    {
      id: 'salary',
      type: 'income' as const,
      amount: 8000,
      category: '工资',
      note: '六月工资',
      occurredAt: '2026-06-10T09:00:00.000Z'
    }
  ]

  it('matches category, note, amount, date, and transaction type', () => {
    expect(searchTransactions(transactions, '餐饮').map(({ id }) => id)).toEqual(['lunch'])
    expect(searchTransactions(transactions, '同事 午饭').map(({ id }) => id)).toEqual(['lunch'])
    expect(searchTransactions(transactions, '28.50').map(({ id }) => id)).toEqual(['lunch'])
    expect(searchTransactions(transactions, '2026-06-10').map(({ id }) => id)).toEqual(['salary'])
    expect(searchTransactions(transactions, '收入').map(({ id }) => id)).toEqual(['salary'])
  })

  it('returns all transactions for a blank query', () => {
    expect(searchTransactions(transactions, '   ')).toBe(transactions)
  })
})
