import { Pencil } from 'lucide-react'
import { CategoryEmoji } from '../components/CategoryEmoji'
import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'

type TransactionDetailPageProps = {
  transaction: Transaction
  onBack: () => void
  onEdit: () => void
}

export function TransactionDetailPage({ transaction, onBack, onEdit }: TransactionDetailPageProps) {
  const isIncome = transaction.type === 'income'
  const note = getTransactionNoteDisplay(transaction.note)

  return (
    <section className="page transaction-detail-page">
      <div className="page-title-row">
        <h1>账单详情</h1>
        <button type="button" onClick={onBack}>返回</button>
      </div>

      <article className="card transaction-detail-card">
        <div className="transaction-detail-summary">
          <span className="transaction-detail-category">
            <CategoryEmoji category={transaction.category} />
            {transaction.category}
          </span>
          <strong className={isIncome ? 'income' : 'expense'}>
            {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
          </strong>
          <small>{isIncome ? '收入' : '支出'}</small>
        </div>

        <dl className="transaction-detail-list">
          <div><dt>日期</dt><dd>{transaction.occurredAt.slice(0, 10)}</dd></div>
          <div><dt>备注</dt><dd>{note ?? '无备注'}</dd></div>
        </dl>

        <button className="primary transaction-detail-edit" type="button" onClick={onEdit}>
          <Pencil aria-hidden="true" size={18} />
          编辑
        </button>
      </article>
    </section>
  )
}
