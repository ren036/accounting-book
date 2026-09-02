import type { Transaction } from './transaction'

export type MonthlyBudget = {
  month: string
  amount: number
}

export type BudgetProgress = {
  spent: number
  remaining: number
  percentage: number
}

export function summarizeBudget(transactions: Transaction[], budget: MonthlyBudget): BudgetProgress {
  const spent = transactions
    .filter((transaction) => transaction.type === 'expense')
    .filter((transaction) => transaction.includeInBudget !== false)
    .filter((transaction) => transaction.occurredAt.startsWith(budget.month))
    .reduce((total, transaction) => total + transaction.amount, 0)

  return {
    spent,
    remaining: budget.amount - spent,
    percentage: budget.amount > 0 ? spent / budget.amount * 100 : 0
  }
}
