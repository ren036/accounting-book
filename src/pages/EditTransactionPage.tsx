import { Dialog, Toast } from 'antd-mobile'
import { Trash2 } from 'lucide-react'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { updateTransaction } from '../domain/transaction'
import { saveTransaction } from '../lib/db'

type EditTransactionPageProps = {
  transaction: Transaction
  onCancel: () => void
  onDeleted: (id: string) => Promise<void>
  onSaved: () => Promise<void>
}

export function EditTransactionPage({ transaction, onCancel, onDeleted, onSaved }: EditTransactionPageProps) {
  async function handleSubmit(fields: Transaction | EditableTransactionFields) {
    await saveTransaction(updateTransaction(transaction, fields as EditableTransactionFields))
    await onSaved()
    Toast.show({ content: '修改成功' })
  }

  async function handleDelete() {
    const confirmed = await Dialog.confirm({
      content: '确定删除这笔账单吗？',
      confirmText: '删除',
      cancelText: '取消'
    })

    if (!confirmed) return

    await onDeleted(transaction.id)
  }

  return (
    <section className="page">
      <div className="page-title-row">
        <h1>编辑账单</h1>
        <button type="button" onClick={onCancel}>
          返回
        </button>
      </div>
      <TransactionForm
        initialTransaction={transaction}
        submitText="保存修改"
        footerAction={
          <button className="icon-danger-action" type="button" aria-label="删除账单" onClick={handleDelete}>
            <Trash2 aria-hidden="true" size={20} strokeWidth={2.2} />
          </button>
        }
        onSubmit={handleSubmit}
      />
    </section>
  )
}
