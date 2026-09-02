import { useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { CategoryChart } from '../components/StatisticsCharts'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget } from '../domain/budget'
import { filterMonthTransactionsByType, groupMonthTransactionsByDay, summarizeCategoriesByPrefix, summarizeMonth } from '../domain/summary'
import type { Transaction, TransactionType } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { AutoCenter, Button, Segmented } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { cardClass, emptyClass, expenseClass, fixedListContentClass, fixedListHeaderClass, fixedListPageClass, incomeClass, pageTitleClass } from '../ui/classes'

type MonthTransactionsPageProps = {
  month: string
  transactions: Transaction[]
  budget?: MonthlyBudget
  onBack: () => void
  onOpen: (id: string) => void
}

export function MonthTransactionsPage({ month, transactions, budget, onBack, onOpen }: MonthTransactionsPageProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [searchQuery, setSearchQuery] = useState('')
  const summary = summarizeMonth(transactions, month)
  const budgetProgress = budget ? summarizeBudget(transactions, budget) : null
  const budgetBarPercentage = budgetProgress ? Math.min(Math.max(budgetProgress.percentage, 0), 100) : 0
  const filteredTransactions = searchTransactions(
    filterMonthTransactionsByType(transactions, month, activeType),
    searchQuery
  )
  const categories = summarizeCategoriesByPrefix(filteredTransactions, month, activeType)
  const groups = groupMonthTransactionsByDay(filteredTransactions, month)
  const label = `${Number(month.slice(5, 7))}月账单`
  const emptyText = searchQuery.trim()
    ? '没有找到匹配的账单'
    : activeType === 'expense' ? '这个月还没有支出' : '这个月还没有收入'

  return (
    <section className={fixedListPageClass}>
      <div className={fixedListHeaderClass}>
        <div className={pageTitleClass}>
          <Button color="primary" fill="none" size="middle" aria-label="返回" onClick={onBack}>
            <LeftOutline fontSize={22} />
          </Button>
          <AutoCenter className='text-lg'>{label}</AutoCenter>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={cardClass}>
            <span>收入</span>
            <strong className={incomeClass}>{formatMoney(summary.income)}</strong>
          </div>
          <div className={cardClass}>
            <span>支出</span>
            <strong className={expenseClass}>{formatMoney(summary.expense)}</strong>
          </div>
          <div className={cardClass}>
            <span>结余</span>
            <strong>{formatMoney(summary.balance)}</strong>
          </div>
        </div>
        <div className={`${cardClass} grid gap-3`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="text-sm text-[var(--book-muted)]">本月预算</span>
              <strong className="mt-1 block text-xl">{budget ? formatMoney(budget.amount) : '未设置'}</strong>
            </div>
            {budgetProgress && <span className={budgetProgress.remaining < 0 ? expenseClass : incomeClass}>{budgetProgress.percentage.toFixed(0)}%</span>}
          </div>
          {budgetProgress && (
            <>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100" aria-label="预算使用进度">
                <div className={`h-full rounded-full ${budgetProgress.percentage > 100 ? 'bg-[var(--book-expense)]' : 'bg-[var(--book-green)]'}`} style={{ width: `${budgetBarPercentage}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--book-muted)]">
                <span>已计入支出 {formatMoney(budgetProgress.spent)}</span>
                <span>{budgetProgress.remaining < 0 ? '超出' : '剩余'} {formatMoney(Math.abs(budgetProgress.remaining))}</span>
              </div>
            </>
          )}
        </div>
        <Segmented block className="w-full" options={[
          { label: '支出', value: 'expense' },
          { label: '收入', value: 'income' },
        ]}
          value={activeType}
          onChange={(value) => setActiveType(value as TransactionType)}
        />
        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className={`${fixedListContentClass} grid content-start gap-2.5`}>
        <CategoryChart
          categories={categories}
          eyebrow="月度构成"
          title={`${activeType === 'expense' ? '支出' : '收入'}分类`}
          totalLabel={`总${activeType === 'expense' ? '支出' : '收入'}`}
        />
        {groups.length === 0 ? (
          <p className={emptyClass}>{emptyText}</p>
        ) : (
          <div>
            {groups.map((group) => (
              <section className="daily-group" key={group.date}>
                {group.label}
                <div className="grid gap-2.5">
                  {group.transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} onOpen={onOpen} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
