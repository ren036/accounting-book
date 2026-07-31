import { useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { getAvailableStatYears, summarizeYear, summarizeYearMonths } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth, currentYear } from '../lib/dates'
import { formatMoney } from '../lib/money'

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
  const matchingMonths = new Set(
    filteredTransactions
      .filter((transaction) => transaction.occurredAt.startsWith(year))
      .map((transaction) => transaction.occurredAt.slice(0, 7))
  )
  const months = summarizeYearMonths(filteredTransactions, year, currentMonth())
    .filter((month) => !hasSearchQuery || matchingMonths.has(month.month))

  return (
    <section className="page fixed-list-page stats-page">
      <div className="fixed-list-header">
        <h1>统计</h1>
        <label className="field stats-filter">
          <span>年份</span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            {availableYears.map((item) => (
              <option key={item} value={item}>
                {item}年
              </option>
            ))}
          </select>
        </label>

        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />

        <div className="summary-grid stats-summary">
          <div className="card">
            <span>年收入</span>
            <strong className="income">{formatMoney(summary.income)}</strong>
          </div>
          <div className="card">
            <span>年支出</span>
            <strong className="expense">{formatMoney(summary.expense)}</strong>
          </div>
          <div className="card">
            <span>年结余</span>
            <strong>{formatMoney(summary.balance)}</strong>
          </div>
        </div>
      </div>

      <section className="fixed-list-content stats-months-section">
        <h2>{hasSearchQuery ? '搜索结果' : '月度明细'}</h2>
        {months.length === 0 && hasSearchQuery ? (
          <p className="empty">这一年没有找到匹配的账单</p>
        ) : (
          <div className="month-stats-list">
            {months.map((month) => (
              <button className="month-stats-row month-stats-button" key={month.month} type="button" onClick={() => onOpenMonth(month.month)}>
                <strong>{month.label}</strong>
                <div>
                  <span>收入</span>
                  <b className="income">{formatMoney(month.income)}</b>
                </div>
                <div>
                  <span>支出</span>
                  <b className="expense">{formatMoney(month.expense)}</b>
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
