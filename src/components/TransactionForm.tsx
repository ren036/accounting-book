import { useState } from 'react'
import type { ReactNode } from 'react'
import { expenseCategories, incomeCategories } from '../domain/categories'
import type { EditableTransactionFields, Transaction, TransactionType } from '../domain/transaction'
import { clampInputDateToMax, todayInputValue } from '../lib/dates'
import { AmountInput } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'

type TransactionFormProps = {
  initialTransaction?: Transaction
  submitText?: string
  footerAction?: ReactNode
  onSubmit: (transaction: Transaction | EditableTransactionFields) => Promise<void>
}

export function TransactionForm({ initialTransaction, submitText = '保存', footerAction, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialTransaction?.type ?? 'expense')
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : '')
  const [category, setCategory] = useState(initialTransaction?.category ?? expenseCategories[0])
  const [note, setNote] = useState(initialTransaction?.note ?? '')
  const [occurredAt, setOccurredAt] = useState(initialTransaction?.occurredAt.slice(0, 10) ?? todayInputValue())

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const maxDate = todayInputValue()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      window.alert('请输入大于 0 的金额')
      return
    }

    const fields = {
      type,
      amount: Math.round(numericAmount * 100) / 100,
      category,
      note: note.trim(),
      occurredAt: `${clampInputDateToMax(occurredAt, maxDate)}T00:00:00.000Z`
    }

    if (initialTransaction) {
      await onSubmit(fields)
      return
    }

    await onSubmit({
      id: crypto.randomUUID(),
      ...fields
    })

    setAmount('')
    setNote('')
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType)
    setCategory(nextType === 'income' ? incomeCategories[0] : expenseCategories[0])
  }

  return (
    <form className="card form transaction-form" onSubmit={handleSubmit}>
      <div className="transaction-form-header">
        <div className="segmented">
          <button type="button" className={type === 'expense' ? 'active' : ''} onClick={() => handleTypeChange('expense')}>
            支出
          </button>
          <button type="button" className={type === 'income' ? 'active' : ''} onClick={() => handleTypeChange('income')}>
            收入
          </button>
        </div>
      </div>

      <div className="transaction-form-body">
        <AmountInput value={amount} onChange={setAmount} autoFocus={!initialTransaction} />

        <CategoryPicker categories={categories} value={category} onChange={setCategory} />

        <label className="field">
          <span>日期</span>
          <input
            className="native-date-input"
            type="date"
            value={occurredAt}
            max={maxDate}
            onChange={(event) => setOccurredAt(clampInputDateToMax(event.target.value, maxDate))}
          />
        </label>

        <label className="field">
          <span>备注</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      <div className={`transaction-form-footer${footerAction ? ' has-action' : ''}`}>
        {footerAction}
        <button className="primary" type="submit">
          {submitText}
        </button>
      </div>
    </form>
  )
}
