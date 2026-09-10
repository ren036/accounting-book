import { TransactionEditorPage } from '../components/TransactionEditorPage'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { updateTransaction } from '../domain/transaction'
import { saveTransaction } from '../lib/db'
import { showMessage } from '../ui/feedback'

type EditTransactionPageProps = {
  transaction: Transaction
  viewportHeight: number
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EditTransactionPage({ transaction, viewportHeight, onCancel, onSaved }: EditTransactionPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction(updateTransaction(transaction, fields))
    await onSaved()
    showMessage('修改成功')
  }

  return (
    <TransactionEditorPage
      title="编辑账单"
      formId="edit-transaction-form"
      viewportHeight={viewportHeight}
      initialTransaction={transaction}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  )
}
