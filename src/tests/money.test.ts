import { describe, expect, it } from 'vitest'
import { evaluateAmountExpression, formatMoney } from '../lib/money'

describe('formatMoney', () => {
  it('formats money with two decimal places', () => {
    expect(formatMoney(12)).toBe('12.00')
  })
})

describe('evaluateAmountExpression', () => {
  it('evaluates addition expressions', () => {
    expect(evaluateAmountExpression('10+2')).toBe(12)
    expect(evaluateAmountExpression('10.5+2+0.25')).toBe(12.75)
  })

  it('rejects malformed amount expressions', () => {
    expect(evaluateAmountExpression('10+')).toBeNull()
    expect(evaluateAmountExpression('++2')).toBeNull()
    expect(evaluateAmountExpression('abc')).toBeNull()
  })
})
