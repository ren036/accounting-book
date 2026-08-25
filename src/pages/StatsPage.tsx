import { useState } from 'react'
import { ExpenseCategoryChart, MonthlyTrendChart } from '../components/StatisticsCharts'
import { TransactionSearch } from '../components/TransactionSearch'
import { getAvailableStatYears, summarizeCategoriesByPrefix, summarizeYear, summarizeYearMonths } from '../domain/summary'
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
  const expenseCategories = summarizeCategoriesByPrefix(filteredTransactions, year, 'expense')
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
        <div className="stats-title-row">
          <div>
            <span className="eyebrow">财务洞察</span>
            <h1>统计分析</h1>
          </div>
          <label className="stats-year-filter">
            <span className="visually-hidden">年份</span>
            <select aria-label="统计年份" value={year} onChange={(event) => setYear(event.target.value)}>
              {availableYears.map((item) => (
                <option key={item} value={item}>
                  {item}年
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="summary-grid stats-summary">
          <div className="card stats-total-card income-total-card">
            <span>总收入</span>
            <strong>{formatMoney(summary.income)}</strong>
          </div>
          <div className="card stats-total-card expense-total-card">
            <span>总支出</span>
            <strong>{formatMoney(summary.expense)}</strong>
          </div>
          <div className="card stats-total-card balance-total-card">
            <span>结余</span>
            <strong>{summary.balance >= 0 ? '+' : ''}{formatMoney(summary.balance)}</strong>
          </div>
        </div>

        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className="fixed-list-content stats-months-section">
        <div className="stats-charts-grid">
          <MonthlyTrendChart months={months} />
          <ExpenseCategoryChart categories={expenseCategories} />
        </div>

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">账目明细</span>
            <h2>{hasSearchQuery ? '搜索结果' : '月度明细'}</h2>
          </div>
          <span>{months.length} 个月</span>
        </div>
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
