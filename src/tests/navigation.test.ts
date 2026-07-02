import { describe, expect, it } from 'vitest'
import { finishCreatingTransaction, finishEditingTransaction, openStatsMonth, switchMainTab } from '../domain/navigation'

describe('stats month navigation', () => {
  it('opens selected stats month without changing current page', () => {
    expect(openStatsMonth('2026-06')).toEqual({
      currentPage: 'stats',
      viewingStatsMonth: '2026-06'
    })
  })

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
