import { useState } from 'react'
import { CategoryEmoji } from '../components/CategoryEmoji'
import { filterMonthTransactionsByType, groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction, TransactionType } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'

type MonthTransactionsPageProps = {
  month: string
  transactions: Transaction[]
  onBack: () => void
  onEdit: (id: string) => void
}

export function MonthTransactionsPage({ month, transactions, onBack, onEdit }: MonthTransactionsPageProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const summary = summarizeMonth(transactions, month)
  const filteredTransactions = filterMonthTransactionsByType(transactions, month, activeType)
  const groups = groupMonthTransactionsByDay(filteredTransactions, month)
  const label = `${Number(month.slice(5, 7))}月账单`
  const emptyText = activeType === 'expense' ? '这个月还没有支出' : '这个月还没有收入'

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

type TransactionRowProps = {
  transaction: Transaction
  onEdit: (id: string) => void
}

function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const note = getTransactionNoteDisplay(transaction.note)

  return (
    <button className="transaction transaction-button" type="button" onClick={() => onEdit(transaction.id)}>
      <div className="icon-label">
        <CategoryEmoji category={transaction.category} />
        <div>
          <strong>{transaction.category}</strong>
          {note && <p>{note}</p>}
        </div>
      </div>
      <div className={transaction.type === 'income' ? 'income' : 'expense'}>
        {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
      </div>
    </button>
  )
}
