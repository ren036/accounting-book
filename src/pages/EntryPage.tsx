import { AutoCenter, Button, Toast } from 'antd-mobile'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields } from '../domain/transaction'
import { saveTransaction } from '../lib/db'
import { pageClass, pageTitleClass } from '../ui/classes'

type EntryPageProps = {
  viewportHeight: number
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EntryPage({ viewportHeight, onCancel, onSaved }: EntryPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction({ id: crypto.randomUUID(), ...fields })
    await onSaved()
    Toast.show({ content: '保存成功' })
  }

  return (
    <section className={`${pageClass} grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden`}>
      <div className={`${pageTitleClass} px-3`}>
        <Button color="primary" fill="none" size="middle" aria-label="取消" onClick={onCancel}>
          取消
        </Button>
        <AutoCenter className="text-lg">记一笔</AutoCenter>
        <Button

          color="primary"
          fill="none"
          size="middle"
          type="submit"
          form="entry-transaction-form"
          aria-label="保存"
        >
          保存
        </Button>
      </div>
      <TransactionForm id="entry-transaction-form" viewportHeight={viewportHeight} onSubmit={handleSubmit} />
    </section>
  )
}
