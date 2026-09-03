import { useMemo, useRef, useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { CategoryChart } from '../components/StatisticsCharts'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget } from '../domain/budget'
import { filterMonthTransactionsByType, groupMonthTransactionsByDay, summarizeCategoriesByPrefix, summarizeMonth } from '../domain/summary'
import type { Transaction, TransactionType } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth, shiftMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { AutoCenter, Button, Dropdown, Segmented } from 'antd-mobile'
import type { DropdownRef } from 'antd-mobile'
import { CheckOutline, LeftOutline } from 'antd-mobile-icons'
import { cardClass, emptyClass, expenseClass, fixedListContentClass, fixedListHeaderClass, fixedListPageClass, incomeClass, pageTitleClass } from '../ui/classes'

type MonthTransactionsPageProps = {
  month: string
  transactions: Transaction[]
  budget?: MonthlyBudget
  onBack: () => void
  onChangeMonth: (month: string) => void
  onOpen: (id: string) => void
}

export function MonthTransactionsPage({ month, transactions, budget, onBack, onChangeMonth, onOpen }: MonthTransactionsPageProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [searchQuery, setSearchQuery] = useState('')
  const monthDropdownRef = useRef<DropdownRef>(null)
  const selectableMonths = useMemo(() => {
    const recordedMonths = transactions
      .map((transaction) => transaction.occurredAt.slice(0, 7))
      .filter((value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value))
    const boundaries = [...recordedMonths, currentMonth(), month].sort()
    const oldestMonth = boundaries[0]
    const newestMonth = boundaries.at(-1) ?? month
    const options: string[] = []

    for (let value = newestMonth; value >= oldestMonth; value = shiftMonth(value, -1)) {
      options.push(value)
    }
    return options
  }, [month, transactions])
  const summary = summarizeMonth(transactions, month)
  const budgetProgress = budget ? summarizeBudget(transactions, budget) : null
  const budgetBarPercentage = budgetProgress ? Math.min(Math.max(budgetProgress.percentage, 0), 100) : 0
  const filteredTransactions = searchTransactions(
    filterMonthTransactionsByType(transactions, month, activeType),
    searchQuery
  )
  const categories = summarizeCategoriesByPrefix(filteredTransactions, month, activeType)
  const groups = groupMonthTransactionsByDay(filteredTransactions, month)
  const emptyText = searchQuery.trim()
    ? '没有找到匹配的账单'
    : activeType === 'expense' ? '这个月还没有支出' : '这个月还没有收入'
  const changeMonth = (nextMonth: string) => {
    setSearchQuery('')
    onChangeMonth(nextMonth)
    monthDropdownRef.current?.close()
  }

  return (
    <section className={fixedListPageClass}>
      <div className={fixedListHeaderClass}>
        <div className={pageTitleClass}>
          <Button color="primary" fill="none" size="middle" aria-label="返回" onClick={onBack}>
            <LeftOutline fontSize={22} />
          </Button>
          <AutoCenter className="w-full">
            <Dropdown
              ref={monthDropdownRef}
              className="w-full max-w-[210px] overflow-hidden rounded-full border border-[var(--book-border)] bg-white [&_.adm-dropdown-item-title]:w-full [&_.adm-dropdown-item-title]:justify-center [&_.adm-dropdown-item-title]:!px-4 [&_.adm-dropdown-item-title]:!py-2 [&_.adm-dropdown-item-title-text]:font-semibold [&_.adm-dropdown-item-title-text]:text-[var(--book-green)] [&_.adm-dropdown-nav]:border-0"
              aria-label="选择账单月份"
            >
              <Dropdown.Item key="month" title={`${month.replace('-', '年')}月账单`} highlight>
                <div className="max-h-[55vh] overflow-y-auto bg-white px-3 py-2">
                  {selectableMonths.map((value) => {
                    const selected = value === month
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`grid w-full grid-cols-[1fr_24px] items-center rounded-xl border-0 px-4 py-3 text-left text-base ${selected ? 'bg-[var(--book-green-soft)] font-semibold text-[var(--book-green)]' : 'bg-transparent text-inherit'}`}
                        aria-current={selected ? 'true' : undefined}
                        onClick={() => changeMonth(value)}
                      >
                        <span>{value.replace('-', '年')}月账单</span>
                        {selected && <CheckOutline aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              </Dropdown.Item>
            </Dropdown>
          </AutoCenter>
          <span aria-hidden="true" />
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
                <span>日常消费 {formatMoney(budgetProgress.spent)}</span>
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
