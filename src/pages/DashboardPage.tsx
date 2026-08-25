import { useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'

type DashboardPageProps = {
  transactions: Transaction[]
  onOpen: (id: string) => void
}

export function DashboardPage({ transactions, onOpen }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const month = currentMonth()
  const summary = summarizeMonth(transactions, month)
  const groups = groupMonthTransactionsByDay(searchTransactions(transactions, searchQuery), month)
  const hasSearchQuery = searchQuery.trim().length > 0

  return (
    <section className="page hero-page fixed-list-page">
      <div className="fixed-list-header">
        <div className="hero-card">
          <span>本月结余</span>
          <strong>{formatMoney(summary.balance)}</strong>
          <p>纯本地保存，记得定期导出备份。</p>
        </div>
        <div className="summary-grid">
          <div className="card">
            <span>收入</span>
            <strong className="income">{formatMoney(summary.income)}</strong>
          </div>
          <div className="card">
            <span>支出</span>
            <strong className="expense">{formatMoney(summary.expense)}</strong>
          </div>
        </div>
        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className="dashboard-transactions fixed-list-content">
        <h2>当月账单详情</h2>
        {groups.length === 0 ? (
          <p className="empty">{hasSearchQuery ? '没有找到匹配的账单' : '这个月还没有账单'}</p>
        ) : (
          <div className="daily-groups">
            {groups.map((group) => (
              <section className="daily-group" key={group.date}>
                <h3>{group.label}</h3>
                <div className="list">
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
