import { describe, expect, it } from 'vitest'
import { openStatsMonth } from '../domain/navigation'

describe('stats month navigation', () => {
  it('opens selected stats month without changing current page', () => {
    expect(openStatsMonth('2026-06')).toEqual({
      currentPage: 'stats',
      viewingStatsMonth: '2026-06'
    })
  })
})
