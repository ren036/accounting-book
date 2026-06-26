import { describe, expect, it } from 'vitest'
import { clampInputDateToMax } from '../lib/dates'

describe('dates', () => {
  it('clamps an input date to the maximum allowed date', () => {
    expect(clampInputDateToMax('2026-06-27', '2026-06-26')).toBe('2026-06-26')
  })

  it('keeps an input date when it is not after the maximum allowed date', () => {
    expect(clampInputDateToMax('2026-06-25', '2026-06-26')).toBe('2026-06-25')
  })
})
