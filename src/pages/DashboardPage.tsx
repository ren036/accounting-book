import { CategoryEmoji } from '../components/CategoryEmoji'
import { groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'

type DashboardPageProps = {
  transactions: Transaction[]
  onEdit: (id: string) => void
}

export function DashboardPage({ transactions, onEdit }: DashboardPageProps) {
  const month = currentMonth()
  const summary = summarizeMonth(transactions, month)
  const groups = groupMonthTransactionsByDay(transactions, month)

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
      </div>

      <section className="dashboard-transactions fixed-list-content">
        <h2>当月账单详情</h2>
        {groups.length === 0 ? (
          <p className="empty">这个月还没有账单</p>
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
