import type { PageKey } from '../components/BottomNav'

export type StatsMonthNavigationState = {
  currentPage: PageKey
  viewingStatsMonth: string
}

export type AppNavigationState = {
  currentPage: PageKey
  editingTransactionId: string | null
  viewingStatsMonth: string | null
}

export function openStatsMonth(month: string): StatsMonthNavigationState {
  return {
    currentPage: 'stats',
    viewingStatsMonth: month
  }
}

export function switchMainTab(page: PageKey): AppNavigationState {
  return {
    currentPage: page,
    editingTransactionId: null,
    viewingStatsMonth: null
  }
}

export function finishCreatingTransaction(): AppNavigationState {
  return {
    currentPage: 'dashboard',
    editingTransactionId: null,
    viewingStatsMonth: null
  }
}

export function finishEditingTransaction(currentPage: PageKey): AppNavigationState {
  return {
    currentPage,
    editingTransactionId: null,
    viewingStatsMonth: null
  }
}
