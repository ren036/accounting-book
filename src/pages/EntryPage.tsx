import { Toast } from 'antd-mobile'
import { Check, X } from 'lucide-react'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields } from '../domain/transaction'
import { saveTransaction } from '../lib/db'

type EntryPageProps = {
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EntryPage({ onCancel, onSaved }: EntryPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction({ id: crypto.randomUUID(), ...fields })
    await onSaved()
    Toast.show({ content: '保存成功' })
  }

  return (
    <section className="page entry-page">
      <div className="page-title-row">
        <button className="page-icon-button" type="button" aria-label="取消" onClick={onCancel}>
          <X aria-hidden="true" size={22} />
        </button>
        <h1>记一笔</h1>
        <button className="page-icon-button page-save-button" type="submit" form="entry-transaction-form" aria-label="保存">
          <Check aria-hidden="true" size={22} />
        </button>
      </div>
      <TransactionForm id="entry-transaction-form" onSubmit={handleSubmit} />
    </section>
  )
}
