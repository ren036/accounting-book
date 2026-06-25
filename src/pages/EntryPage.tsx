import { Toast } from 'antd-mobile'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { saveTransaction } from '../lib/db'

type EntryPageProps = {
  onSaved: () => Promise<void>
}

export function EntryPage({ onSaved }: EntryPageProps) {
  async function handleSubmit(transaction: Transaction) {
    await saveTransaction(transaction)
    await onSaved()
    Toast.show({ content: '保存成功' })
  }

  return (
    <section className="page">
      <h1>记一笔</h1>
      <TransactionForm onSubmit={(transaction: Transaction | EditableTransactionFields) => handleSubmit(transaction as Transaction)} />
    </section>
  )
}
