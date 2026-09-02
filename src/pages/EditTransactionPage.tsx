import { AutoCenter, Button, Toast } from 'antd-mobile'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { updateTransaction } from '../domain/transaction'
import { saveTransaction } from '../lib/db'
import { pageClass, pageTitleClass } from '../ui/classes'

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
    Toast.show({ content: '修改成功' })
  }

  return (
    <section className={`${pageClass} grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden`}>
      <div className={pageTitleClass}>
        <Button color="primary" fill="none" size='middle' aria-label="取消" onClick={onCancel}>
          取消
        </Button>
        <AutoCenter className="text-lg">编辑账单</AutoCenter>

        <Button

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
        viewportHeight={viewportHeight}
        initialTransaction={transaction}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
