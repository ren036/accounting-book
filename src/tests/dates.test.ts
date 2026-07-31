import { describe, expect, it } from 'vitest'
import { clampInputDateToMax, currentMonth, currentYear, todayInputValue } from '../lib/dates'

describe('dates', () => {
  it('clamps an input date to the maximum allowed date', () => {
    expect(clampInputDateToMax('2026-06-27', '2026-06-26')).toBe('2026-06-26')
  })

  it('keeps an input date when it is not after the maximum allowed date', () => {
    expect(clampInputDateToMax('2026-06-25', '2026-06-26')).toBe('2026-06-25')
  })

  it('uses the local calendar date instead of the UTC date', () => {
    const localDate = new Date(2026, 0, 2, 1, 30)

    expect(todayInputValue(localDate)).toBe('2026-01-02')
    expect(currentMonth(localDate)).toBe('2026-01')
    expect(currentYear(localDate)).toBe('2026')
  })
})
