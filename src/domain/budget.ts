import type { Transaction } from './transaction'

export type MonthlyBudget = {
  month: string
  amount: number
}

type BudgetProgress = {
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

function summarizeDailyExpense(transactions: Transaction[], prefix: string): number {
  return transactions.reduce((total, transaction) => {
    if (
      transaction.type !== 'expense'
      || transaction.includeInBudget === false
      || !transaction.occurredAt.startsWith(prefix)
    ) return total

    return total + transaction.amount
  }, 0)
}
