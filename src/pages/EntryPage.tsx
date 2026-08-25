import { Button, Toast } from 'antd-mobile'
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
        <Button className="page-text-button" color="primary" fill="none" size="mini" aria-label="取消" onClick={onCancel}>
          取消
        </Button>
        <h4>记一笔</h4>
        <Button
          className="page-text-button"
          color="primary"
          fill="none"
          size="mini"
          type="submit"
          form="entry-transaction-form"
          aria-label="保存"
        >
          保存
        </Button>
      </div>
      <TransactionForm id="entry-transaction-form" onSubmit={handleSubmit} />
    </section>
  )
}
