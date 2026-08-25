import { Toast } from 'antd-mobile'
import { Check, X } from 'lucide-react'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { updateTransaction } from '../domain/transaction'
import { saveTransaction } from '../lib/db'

type EditTransactionPageProps = {
  transaction: Transaction
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EditTransactionPage({ transaction, onCancel, onSaved }: EditTransactionPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction(updateTransaction(transaction, fields))
    await onSaved()
    Toast.show({ content: '修改成功' })
  }

  return (
    <section className="page entry-page">
      <div className="page-title-row">
        <button className="page-icon-button" type="button" aria-label="取消" onClick={onCancel}>
          <X aria-hidden="true" size={22} />
        </button>
        <h1>编辑账单</h1>
        <button className="page-icon-button page-save-button" type="submit" form="edit-transaction-form" aria-label="保存">
          <Check aria-hidden="true" size={22} />
        </button>
      </div>
      <TransactionForm
        id="edit-transaction-form"
        initialTransaction={transaction}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
