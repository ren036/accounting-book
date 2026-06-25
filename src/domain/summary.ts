import type { Transaction } from './transaction'

export type MonthSummary = {
  income: number
  expense: number
  balance: number
}

export type CategorySummary = {
  category: string
  amount: number
}

export type MonthDetailSummary = MonthSummary & {
  month: string
  label: string
}

export type DailyTransactionGroup = {
  date: string
  label: string
  transactions: Transaction[]
}

export function summarizeMonth(transactions: Transaction[], month: string): MonthSummary {
  return transactions
    .filter((transaction) => transaction.occurredAt.startsWith(month))
    .reduce(
      (summary, transaction) => {
        if (transaction.type === 'income') {
          summary.income += transaction.amount
        } else {
          summary.expense += transaction.amount
        }

        summary.balance = summary.income - summary.expense
        return summary
      },
      { income: 0, expense: 0, balance: 0 }
    )
}

export function summarizeExpenseCategories(transactions: Transaction[], month: string): CategorySummary[] {
  const totals = transactions
    .filter((transaction) => transaction.type === 'expense')
    .filter((transaction) => transaction.occurredAt.startsWith(month))
    .reduce<Record<string, number>>((result, transaction) => {
      result[transaction.category] = (result[transaction.category] ?? 0) + transaction.amount
      return result
    }, {})

  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function summarizeYear(transactions: Transaction[], year: string): MonthSummary {
  return transactions
    .filter((transaction) => transaction.occurredAt.startsWith(year))
    .reduce(
      (summary, transaction) => {
        if (transaction.type === 'income') {
          summary.income += transaction.amount
        } else {
          summary.expense += transaction.amount
        }

        summary.balance = summary.income - summary.expense
        return summary
      },
      { income: 0, expense: 0, balance: 0 }
    )
}

export function summarizeYearMonths(transactions: Transaction[], year: string, currentMonth?: string): MonthDetailSummary[] {
  const activeMonths = transactions
    .map((transaction) => transaction.occurredAt.slice(0, 7))
    .sort()

  const oldestMonth = activeMonths[0]
  const lowerBoundMonth = oldestMonth?.startsWith(year) ? Number(oldestMonth.slice(5, 7)) : 1
  const upperBoundMonth = currentMonth?.startsWith(year) ? Number(currentMonth.slice(5, 7)) : 12

  if (upperBoundMonth < lowerBoundMonth) return []

  return Array.from({ length: upperBoundMonth - lowerBoundMonth + 1 }, (_item, index) => upperBoundMonth - index).map((monthNumber) => {
    const month = `${year}-${String(monthNumber).padStart(2, '0')}`
    return {
      month,
      label: `${monthNumber}月`,
      ...summarizeMonth(transactions, month)
    }
  })
}

export function getAvailableStatYears(transactions: Transaction[], currentMonth: string): string[] {
  const currentYear = Number(currentMonth.slice(0, 4))
  const activeMonths = transactions
    .map((transaction) => transaction.occurredAt.slice(0, 7))
    .sort()

  const oldestYear = activeMonths.length > 0 ? Number(activeMonths[0].slice(0, 4)) : currentYear

  return Array.from({ length: currentYear - oldestYear + 1 }, (_item, index) => String(currentYear - index))
}

export function groupMonthTransactionsByDay(transactions: Transaction[], month: string): DailyTransactionGroup[] {
  const groups = transactions
    .filter((transaction) => transaction.occurredAt.startsWith(month))
    .reduce<Record<string, Transaction[]>>((result, transaction) => {
      const date = transaction.occurredAt.slice(0, 10)
      result[date] = result[date] ?? []
      result[date].push(transaction)
      return result
    }, {})

  return Object.entries(groups)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, dayTransactions]) => {
      const monthNumber = Number(date.slice(5, 7))
      const dayNumber = Number(date.slice(8, 10))
      return {
        date,
        label: `${monthNumber}月${dayNumber}日`,
        transactions: [...dayTransactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      }
    })
}
