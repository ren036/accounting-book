import { describe, expect, it } from 'vitest'
import { formatMoney, parseAmountExpression } from '../lib/money'

describe('formatMoney', () => {
  it('formats amounts with two decimals', () => {
    expect(formatMoney(3)).toBe('3.00')
  })
})

describe('parseAmountExpression', () => {
  it('parses plain amounts', () => {
    expect(parseAmountExpression('12.34')).toBe(12.34)
  })

  it('calculates addition and subtraction', () => {
    expect(parseAmountExpression('1+2-0.5')).toBe(2.5)
  })

  it('allows spaces and signed terms', () => {
    expect(parseAmountExpression(' 10 + .5 - 2 ')).toBe(8.5)
  })

  it('rejects invalid expressions', () => {
    expect(parseAmountExpression('1++2')).toBeNaN()
    expect(parseAmountExpression('1*2')).toBeNaN()
    expect(parseAmountExpression('')).toBeNaN()
  })
})
