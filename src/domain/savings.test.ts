import { describe, expect, it } from 'vitest'
import type { Transaction } from './transaction'
import type { SavingsMovement } from './savings'
import { calibrateOpeningDisposableBalance, getBucketBalance, getSuggestedMonthlyDeposit, getTotalSavings, normalizeSavingsBucketStatus, summarizeDisposable, summarizeSavingsMonths } from './savings'

const transactions: Transaction[] = [
  { id: 'income', type: 'income', amount: 8000, category: '工资', note: '', occurredAt: '2026-08-01 09:00:00', includeInBudget: false },
  { id: 'expense', type: 'expense', amount: 3000, category: '生活', note: '', occurredAt: '2026-08-10 09:00:00', includeInBudget: true },
  { id: 'next-income', type: 'income', amount: 1000, category: '其他', note: '', occurredAt: '2026-09-01 09:00:00', includeInBudget: false }
]

const movements: SavingsMovement[] = [
  { id: 'deposit', bucketId: 'general', type: 'deposit', amount: 1500, occurredAt: '2026-08-15 09:00:00', note: '' },
  { id: 'goal', bucketId: 'computer', type: 'deposit', amount: 1000, occurredAt: '2026-08-16 09:00:00', note: '' },
  { id: 'withdrawal', bucketId: 'general', type: 'withdrawal', amount: 200, occurredAt: '2026-09-02 09:00:00', note: '' }
]

describe('savings', () => {
  it('根据流水计算储蓄桶余额', () => {
    expect(getBucketBalance(movements, 'general')).toBe(1300)
    expect(getBucketBalance(movements, 'computer')).toBe(1000)
  })

  it('已使用和已取消的专项不计入储蓄总额', () => {
    const buckets = [
      { id: 'computer', kind: 'goal' as const, name: '电脑', targetAmount: 1000, targetDate: null, createdAt: '', status: 'used' as const },
      { id: 'cancelled', kind: 'goal' as const, name: '取消目标', targetAmount: 500, targetDate: null, createdAt: '', status: 'cancelled' as const }
    ]
    const withCancelled = [...movements, { id: 'cancelled-deposit', bucketId: 'cancelled', type: 'deposit' as const, amount: 500, occurredAt: '2026-08-20 09:00:00', note: '' }]
    expect(getTotalSavings(withCancelled, buckets)).toBe(1300)
    expect(summarizeDisposable(transactions, movements, 1000).balance).toBe(4700)
  })

  it('兼容旧状态名称', () => {
    expect(normalizeSavingsBucketStatus('completed')).toBe('active')
    expect(normalizeSavingsBucketStatus('consumed')).toBe('used')
    expect(normalizeSavingsBucketStatus('cancelled')).toBe('cancelled')
  })

  it('可支配余额会自然累积到下个月', () => {
    expect(summarizeDisposable(transactions, movements, 1000, '2026-09').balance).toBe(3500)
    expect(summarizeDisposable(transactions, movements, 1000).balance).toBe(4700)
  })

  it('可以按当前实际金额校准并抵消历史账单影响', () => {
    const calibratedOpening = calibrateOpeningDisposableBalance(transactions, movements, 593)
    expect(summarizeDisposable(transactions, movements, calibratedOpening).balance).toBe(593)
  })

  it('汇总月度储蓄趋势', () => {
    expect(summarizeSavingsMonths(movements, '2026', '2026-09').slice(-2)).toEqual([
      { month: '2026-08', deposits: 2500, withdrawals: 0, net: 2500 },
      { month: '2026-09', deposits: 0, withdrawals: 200, net: -200 }
    ])
  })

  it('根据目标日期给出每月建议存款', () => {
    const goal = { id: 'goal', kind: 'goal' as const, name: '电脑', targetAmount: 10000, targetDate: '2026-12-31', createdAt: '', status: 'active' as const }
    expect(getSuggestedMonthlyDeposit(goal, 2000, new Date(2026, 8, 3))).toBe(2000)
    expect(getSuggestedMonthlyDeposit({ ...goal, status: 'used' }, 2000, new Date(2026, 8, 3))).toBeNull()
    expect(getSuggestedMonthlyDeposit({ ...goal, status: 'cancelled' }, 2000, new Date(2026, 8, 3))).toBeNull()
  })
})
