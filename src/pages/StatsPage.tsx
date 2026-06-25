import { useState } from 'react'
import { getAvailableStatYears, summarizeYear, summarizeYearMonths } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { currentMonth, currentYear } from '../lib/dates'
import { formatMoney } from '../lib/money'

type StatsPageProps = {
  transactions: Transaction[]
  onOpenMonth: (month: string) => void
}

export function StatsPage({ transactions, onOpenMonth }: StatsPageProps) {
  const [year, setYear] = useState(currentYear())
  const availableYears = getAvailableStatYears(transactions, currentMonth())
  const summary = summarizeYear(transactions, year)
  const months = summarizeYearMonths(transactions, year, currentMonth())

  return (
    <section className="page">
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

      <h2>月度明细</h2>
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
    </section>
  )
}
