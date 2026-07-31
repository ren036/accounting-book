import { describe, expect, it } from 'vitest'
import { finishCreatingTransaction, finishEditingTransaction, switchMainTab } from '../domain/navigation'

describe('app navigation', () => {
  it('leaves edit mode when switching main tabs', () => {
    expect(switchMainTab('stats')).toEqual({
      currentPage: 'stats',
      editingTransactionId: null,
      viewingStatsMonth: null
    })
  })

  it('returns to dashboard after creating a transaction', () => {
    expect(finishCreatingTransaction()).toEqual({
      currentPage: 'dashboard',
      editingTransactionId: null,
      viewingStatsMonth: null
    })
  })

  it('keeps the current tab after editing a transaction', () => {
    expect(finishEditingTransaction('stats')).toEqual({
      currentPage: 'stats',
      editingTransactionId: null,
      viewingStatsMonth: null
    })
  })
})
