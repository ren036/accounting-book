import type { PageKey } from '../components/BottomNav'

export type StatsMonthNavigationState = {
  currentPage: PageKey
  viewingStatsMonth: string
}

export function openStatsMonth(month: string): StatsMonthNavigationState {
  return {
    currentPage: 'stats',
    viewingStatsMonth: month
  }
}
