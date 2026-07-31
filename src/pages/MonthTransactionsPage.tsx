import { useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { filterMonthTransactionsByType, groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction, TransactionType } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { formatMoney } from '../lib/money'

type MonthTransactionsPageProps = {
  month: string
  transactions: Transaction[]
  onBack: () => void
  onEdit: (id: string) => void
}

export function MonthTransactionsPage({ month, transactions, onBack, onEdit }: MonthTransactionsPageProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [searchQuery, setSearchQuery] = useState('')
  const summary = summarizeMonth(transactions, month)
  const filteredTransactions = searchTransactions(
    filterMonthTransactionsByType(transactions, month, activeType),
    searchQuery
  )
  const groups = groupMonthTransactionsByDay(filteredTransactions, month)
  const label = `${Number(month.slice(5, 7))}月账单`
  const emptyText = searchQuery.trim()
    ? '没有找到匹配的账单'
    : activeType === 'expense' ? '这个月还没有支出' : '这个月还没有收入'

  return (
    <section className="page hero-page fixed-list-page">
      <div className="fixed-list-header">
        <div className="page-title-row">
          <h1>{label}</h1>
          <button type="button" onClick={onBack}>
            返回统计
          </button>
        </div>

        <div className="summary-grid stats-summary">
          <div className="card">
            <span>收入</span>
            <strong className="income">{formatMoney(summary.income)}</strong>
          </div>
          <div className="card">
            <span>支出</span>
            <strong className="expense">{formatMoney(summary.expense)}</strong>
          </div>
          <div className="card">
            <span>结余</span>
            <strong>{formatMoney(summary.balance)}</strong>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="账单类型">
          <button
            type="button"
            role="tab"
            aria-selected={activeType === 'expense'}
            className={activeType === 'expense' ? 'active' : ''}
            onClick={() => setActiveType('expense')}
          >
            支出
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeType === 'income'}
            className={activeType === 'income' ? 'active' : ''}
            onClick={() => setActiveType('income')}
          >
            收入
          </button>
        </div>
        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className="fixed-list-content month-transactions-section">
        {groups.length === 0 ? (
          <p className="empty">{emptyText}</p>
        ) : (
          <div className="daily-groups">
            {groups.map((group) => (
              <section className="daily-group" key={group.date}>
                <h3>{group.label}</h3>
                <div className="list">
                  {group.transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} onEdit={onEdit} />
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
