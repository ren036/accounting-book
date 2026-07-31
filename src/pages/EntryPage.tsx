import { Toast } from 'antd-mobile'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields } from '../domain/transaction'
import { saveTransaction } from '../lib/db'

type EntryPageProps = {
  onSaved: () => Promise<void>
}

export function EntryPage({ onSaved }: EntryPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction({ id: crypto.randomUUID(), ...fields })
    await onSaved()
    Toast.show({ content: '保存成功' })
  }

  return (
    <section className="page entry-page">
      <h1>记一笔</h1>
      <TransactionForm onSubmit={handleSubmit} />
    </section>
  )
}
