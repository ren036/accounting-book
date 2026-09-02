import type { PageKey } from '../components/BottomNav'

export type AppNavigationState = {
  currentPage: PageKey
  editingTransactionId: string | null
  viewingStatsMonth: string | null
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
