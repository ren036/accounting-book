import { TransactionEditorPage } from '../components/TransactionEditorPage'
import type { EditableTransactionFields } from '../domain/transaction'
import { saveTransaction } from '../lib/db'
import { showMessage } from '../ui/feedback'

type EntryPageProps = {
  viewportHeight: number
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EntryPage({ viewportHeight, onCancel, onSaved }: EntryPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction({ id: crypto.randomUUID(), ...fields })
    await onSaved()
    showMessage('保存成功')
  }

  return <TransactionEditorPage title="记一笔" formId="entry-transaction-form" viewportHeight={viewportHeight} onCancel={onCancel} onSubmit={handleSubmit} />
}
