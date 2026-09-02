import { useState } from 'react'
import { ExpenseCategoryChart, MonthlyTrendChart } from '../components/StatisticsCharts'
import { TransactionSearch } from '../components/TransactionSearch'
import { getAvailableStatYears, summarizeCategoriesByPrefix, summarizeYear, summarizeYearMonths } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth, currentYear } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { emptyClass, expenseClass, fixedListContentClass, fixedListHeaderClass, fixedListPageClass, incomeClass } from '../ui/classes'
import { AutoCenter } from 'antd-mobile'

type StatsPageProps = {
  transactions: Transaction[]
  onOpenMonth: (month: string) => void
}

export function StatsPage({ transactions, onOpenMonth }: StatsPageProps) {
  const [year, setYear] = useState(currentYear())
  const [searchQuery, setSearchQuery] = useState('')
  const hasSearchQuery = searchQuery.trim().length > 0
  const availableYears = getAvailableStatYears(transactions, currentMonth())
  const filteredTransactions = searchTransactions(transactions, searchQuery)
  const summary = summarizeYear(filteredTransactions, year)
  const expenseCategories = summarizeCategoriesByPrefix(filteredTransactions, year, 'expense')
  const matchingMonths = new Set(
    filteredTransactions
      .filter((transaction) => transaction.occurredAt.startsWith(year))
      .map((transaction) => transaction.occurredAt.slice(0, 7))
  )
  const months = summarizeYearMonths(filteredTransactions, year, currentMonth())
    .filter((month) => !hasSearchQuery || matchingMonths.has(month.month))

  return (
    <section className={fixedListPageClass}>
      <div className={fixedListHeaderClass}>
        <div className="flex items-center justify-between gap-3">
          <AutoCenter className="text-xl font-semibold">统计分析</AutoCenter>
          <label className="flex-1">
            <select className="w-full rounded-full border border-neutral-200 bg-white px-4 py-[9px] font-semibold text-[var(--book-green)]" aria-label="统计年份" value={year} onChange={(event) => setYear(event.target.value)}>
              {availableYears.map((item) => (
                <option key={item} value={item}>
                  {item}年
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[var(--book-radius-card)] bg-white p-[15px] text-[var(--book-income)] shadow-[var(--book-shadow-card)]">
            <span>总收入</span><br/>
            {formatMoney(summary.income)}
          </div>
          <div className="rounded-[var(--book-radius-card)] bg-white p-[15px] text-[var(--book-expense)] shadow-[var(--book-shadow-card)]">
            <span>总支出</span><br/>
            {formatMoney(summary.expense)}
          </div>
          <div className="rounded-[var(--book-radius-card)] bg-white p-[15px] text-neutral-700 shadow-[var(--book-shadow-card)]">
            <span>结余</span><br/>
            {summary.balance >= 0 ? '+' : ''}{formatMoney(summary.balance)}
          </div>
        </div>

        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className={`${fixedListContentClass} grid content-start gap-2.5`}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3">
          <MonthlyTrendChart months={months} />
          <ExpenseCategoryChart categories={expenseCategories} />
        </div>

        <div className="mt-2 flex items-end justify-between gap-3 [&>span]:text-xs [&>span]:text-slate-400 [&_h2]:m-0">
          <div>
            <span className="mb-1 block text-[11px] font-extrabold tracking-[.12em] text-[var(--book-green)]">账目明细</span>
            <h2>{hasSearchQuery ? '搜索结果' : '月度明细'}</h2>
          </div>
          <span>{months.length} 个月</span>
        </div>
        {months.length === 0 && hasSearchQuery ? (
          <p className={emptyClass}>这一年没有找到匹配的账单</p>
        ) : (
          <div className="grid gap-2.5">
            {months.map((month) => (
              <button className="grid w-full grid-cols-[56px_repeat(3,1fr)] items-center gap-2.5 rounded-[18px] border-0 bg-white p-3.5 text-left text-[14px] text-inherit shadow-[var(--book-shadow-card)] [&>div]:grid [&>div]:gap-1 [&_span]:text-[11px] [&_span]:text-gray-500 [&_b]:text-[13px]" key={month.month} type="button" onClick={() => onOpenMonth(month.month)}>
                <strong>{month.label}</strong>
                <div>
                  <span>收入</span>
                  <b className={incomeClass}>{formatMoney(month.income)}</b>
                </div>
                <div>
                  <span>支出</span>
                  <b className={expenseClass}>{formatMoney(month.expense)}</b>
                </div>
                <div>
                  <span>结余</span>
                  <b>{formatMoney(month.balance)}</b>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
