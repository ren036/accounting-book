import { describe, expect, it } from 'vitest'
import { getTransactionNoteDisplay, updateTransaction } from '../domain/transaction'

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
