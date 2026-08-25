import { Button, Toast } from 'antd-mobile'
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
        <Button className="page-text-button" color="primary" fill="none" size='middle' aria-label="取消" onClick={onCancel}>
          取消
        </Button>
        <h3>编辑账单</h3>
        <Button
          className="page-text-button"
          color="primary"
          fill="none"
          size="middle"
          type="submit"
          form="edit-transaction-form"
          aria-label="保存"
        >
          保存
        </Button>
      </div>
      <TransactionForm
        id="edit-transaction-form"
        initialTransaction={transaction}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
