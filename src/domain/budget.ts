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
  const spent = summarizeDailyExpense(transactions, budget.month)

  return {
    spent,
    remaining: budget.amount - spent,
    percentage: budget.amount > 0 ? spent / budget.amount * 100 : 0
  }
}

export function summarizeDailyExpense(transactions: Transaction[], prefix: string): number {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .filter((transaction) => transaction.includeInBudget !== false)
    .filter((transaction) => transaction.occurredAt.startsWith(prefix))
    .reduce((total, transaction) => total + transaction.amount, 0)
}
