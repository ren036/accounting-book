import type { Transaction } from './transaction'

export type SavingsBucketKind = 'general' | 'goal'
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

export type MonthlySavingsSummary = {
  month: string
  deposits: number
  withdrawals: number
  net: number
}

export type DisposableSummary = {
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
    createdAt: new Date().toISOString(),
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

export function summarizeDisposable(
  transactions: Transaction[],
  movements: SavingsMovement[],
  openingBalance: number,
  before?: string
): DisposableSummary {
  const includedTransactions = before
    ? transactions.filter((transaction) => transaction.occurredAt < before)
    : transactions
  const includedMovements = before
    ? movements.filter((movement) => movement.occurredAt < before)
    : movements

  const income = sum(includedTransactions.filter(({ type }) => type === 'income').map(({ amount }) => amount))
  const expense = sum(includedTransactions.filter(({ type }) => type === 'expense').map(({ amount }) => amount))
  const deposits = sum(includedMovements.filter(({ type }) => type === 'deposit').map(({ amount }) => amount))
  const withdrawals = sum(includedMovements.filter(({ type }) => type === 'withdrawal').map(({ amount }) => amount))

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
  return Array.from({ length: upperMonth }, (_item, index) => index + 1).map((monthNumber) => {
    const month = `${year}-${String(monthNumber).padStart(2, '0')}`
    const monthMovements = movements.filter((movement) => movement.occurredAt.startsWith(month))
    const deposits = sum(monthMovements.filter(({ type }) => type === 'deposit').map(({ amount }) => amount))
    const withdrawals = sum(monthMovements.filter(({ type }) => type === 'withdrawal').map(({ amount }) => amount))
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

function sum(values: number[]): number {
  return roundMoney(values.reduce((total, value) => total + value, 0))
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}
