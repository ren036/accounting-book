import { Dialog } from 'antd-mobile'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { CategoryEmoji } from '../components/CategoryEmoji'
import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'

type TransactionDetailPageProps = {
  transaction: Transaction
  onBack: () => void
  onDeleted: (id: string) => Promise<void>
  onEdit: () => void
}

export function TransactionDetailPage({ transaction, onBack, onDeleted, onEdit }: TransactionDetailPageProps) {
  const isIncome = transaction.type === 'income'
  const note = getTransactionNoteDisplay(transaction.note)

  async function handleDelete() {
    const confirmed = await Dialog.confirm({
      content: '确定删除这笔账单吗？',
      confirmText: '删除',
      cancelText: '取消'
    })

    if (confirmed) await onDeleted(transaction.id)
  }

  return (
    <section className="page transaction-detail-page">
      <div className="page-title-row">
        <button className="page-icon-button" type="button" aria-label="返回" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <h1>账单详情</h1>
        <button className="page-icon-button page-delete-button" type="button" aria-label="删除账单" onClick={handleDelete}>
          <Trash2 aria-hidden="true" size={21} />
        </button>
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
