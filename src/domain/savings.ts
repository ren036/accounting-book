import type { Transaction } from './transaction'
import { formatLocalDateTime } from '../lib/dates'
import { roundMoney } from '../lib/money'

type SavingsBucketKind = 'general' | 'goal'
export type SavingsBucketStatus = 'active' | 'used' | 'cancelled'

export type SavingsBucket = {
  id: string
  kind: SavingsBucketKind
  name: string
  targetAmount: number | null
  targetDate: string | null
  createdAt: string
  status: SavingsBucketStatus
}

export type SavingsMovementType = 'deposit' | 'withdrawal'

export type SavingsMovement = {
  id: string
  bucketId: string
  type: SavingsMovementType
  amount: number
  occurredAt: string
  note: string
}

type MonthlySavingsSummary = {
  month: string
  deposits: number
  withdrawals: number
  net: number
}

type DisposableSummary = {
  openingBalance: number
  income: number
  expense: number
  deposits: number
  withdrawals: number
  balance: number
}

export const GENERAL_SAVINGS_BUCKET_ID = 'general-savings'

export function createGeneralSavingsBucket(): SavingsBucket {
  return {
    id: GENERAL_SAVINGS_BUCKET_ID,
    kind: 'general',
    name: '通用储蓄',
    targetAmount: null,
    targetDate: null,
    createdAt: formatLocalDateTime(),
    status: 'active'
  }
}

export function getBucketBalance(movements: SavingsMovement[], bucketId: string): number {
  return roundMoney(movements.reduce((balance, movement) => {
    if (movement.bucketId !== bucketId) return balance
    return movement.type === 'deposit'
      ? balance + movement.amount
      : balance - movement.amount
  }, 0))
}

export function getTotalSavings(movements: SavingsMovement[], buckets?: SavingsBucket[]): number {
  const closedIds = new Set(buckets?.filter(({ status }) => status === 'used' || status === 'cancelled').map(({ id }) => id) ?? [])
  return roundMoney(movements.reduce((total, movement) => (
    closedIds.has(movement.bucketId) ? total :
    movement.type === 'deposit' ? total + movement.amount : total - movement.amount
  ), 0))
}

export function normalizeSavingsBucketStatus(status: unknown): SavingsBucketStatus {
  if (status === 'used' || status === 'consumed') return 'used'
  if (status === 'cancelled') return 'cancelled'
  return 'active'
}

export function isSavingsBucketStatus(status: unknown): status is SavingsBucketStatus {
  return status === 'active' || status === 'used' || status === 'cancelled'
}

export function summarizeDisposable(
  transactions: Transaction[],
  movements: SavingsMovement[],
  openingBalance: number,
  before?: string
): DisposableSummary {
  const totals = transactions.reduce((result, transaction) => {
    if (before && transaction.occurredAt >= before) return result
    result[transaction.type] += transaction.amount
    return result
  }, { income: 0, expense: 0 })
  const movementTotals = movements.reduce((result, movement) => {
    if (before && movement.occurredAt >= before) return result
    result[movement.type === 'deposit' ? 'deposits' : 'withdrawals'] += movement.amount
    return result
  }, { deposits: 0, withdrawals: 0 })

  const income = roundMoney(totals.income)
  const expense = roundMoney(totals.expense)
  const deposits = roundMoney(movementTotals.deposits)
  const withdrawals = roundMoney(movementTotals.withdrawals)

  return {
    openingBalance: roundMoney(openingBalance),
    income,
    expense,
    deposits,
    withdrawals,
    balance: roundMoney(openingBalance + income - expense - deposits + withdrawals)
  }
}

export function calibrateOpeningDisposableBalance(
  transactions: Transaction[],
  movements: SavingsMovement[],
  desiredBalance: number
): number {
  const activityBalance = summarizeDisposable(transactions, movements, 0).balance
  return roundMoney(desiredBalance - activityBalance)
}

export function getGoalProgress(bucket: SavingsBucket, balance: number): number {
  if (!bucket.targetAmount || bucket.targetAmount <= 0) return 0
  return Math.max(0, balance / bucket.targetAmount * 100)
}

export function summarizeSavingsMonths(movements: SavingsMovement[], year: string, throughMonth: string): MonthlySavingsSummary[] {
  const upperMonth = throughMonth.startsWith(year) ? Number(throughMonth.slice(5, 7)) : 12
  const monthlyTotals = movements.reduce<Record<string, { deposits: number; withdrawals: number }>>((result, movement) => {
    const month = movement.occurredAt.slice(0, 7)
    const monthNumber = Number(month.slice(5, 7))
    if (!month.startsWith(year) || monthNumber < 1 || monthNumber > upperMonth) return result

    const totals = result[month] ??= { deposits: 0, withdrawals: 0 }
    totals[movement.type === 'deposit' ? 'deposits' : 'withdrawals'] += movement.amount
    return result
  }, {})

  return Array.from({ length: upperMonth }, (_item, index) => index + 1).map((monthNumber) => {
    const month = `${year}-${String(monthNumber).padStart(2, '0')}`
    const totals = monthlyTotals[month] ?? { deposits: 0, withdrawals: 0 }
    const deposits = roundMoney(totals.deposits)
    const withdrawals = roundMoney(totals.withdrawals)
    return { month, deposits, withdrawals, net: roundMoney(deposits - withdrawals) }
  })
}

export function getSuggestedMonthlyDeposit(bucket: SavingsBucket, balance: number, today = new Date()): number | null {
  if (bucket.kind !== 'goal' || bucket.status !== 'active' || !bucket.targetAmount || !bucket.targetDate) return null
  const remaining = Math.max(bucket.targetAmount - balance, 0)
  if (remaining === 0) return 0

  const [targetYear, targetMonth] = bucket.targetDate.split('-').map(Number)
  if (!targetYear || !targetMonth) return null
  const monthsRemaining = Math.max((targetYear - today.getFullYear()) * 12 + targetMonth - today.getMonth(), 1)
  return Math.ceil(remaining / monthsRemaining * 100) / 100
}
