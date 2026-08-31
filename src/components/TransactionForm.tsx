import { useState } from 'react'
import { expenseCategories, incomeCategories } from '../domain/categories'
import type { EditableTransactionFields, Transaction, TransactionType } from '../domain/transaction'
import { clampInputDateToMax, todayInputValue } from '../lib/dates'
import { parseAmountExpression } from '../lib/money'
import { AmountInput, AmountKeyboard } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { Segmented } from 'antd-mobile'
import { fieldClass } from '../ui/classes'

type TransactionFormProps = {
  id?: string
  initialTransaction?: Transaction
  onSubmit: (fields: EditableTransactionFields) => Promise<void>
}

export function TransactionForm({ id = 'transaction-form', initialTransaction, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialTransaction?.type ?? 'expense')
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : '')
  const [category, setCategory] = useState(initialTransaction?.category ?? expenseCategories[0])
  const [note, setNote] = useState(initialTransaction?.note ?? '')
  const [occurredAt, setOccurredAt] = useState(initialTransaction?.occurredAt.slice(0, 10) ?? todayInputValue())

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const maxDate = todayInputValue()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const numericAmount = parseAmountExpression(amount)
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

    await onSubmit(fields)

    if (!initialTransaction) {
      setAmount('')
      setNote('')
    }
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType)
    setCategory(nextType === 'income' ? incomeCategories[0] : expenseCategories[0])
  }

  return (
    <form id={id} className="grid h-full" onSubmit={handleSubmit}>
      <Segmented block className="w-full mb-4" options={[
        { label: '支出', value: 'expense' },
        { label: '收入', value: 'income' },
      ]} 
        value={type}
        onChange={(value) => handleTypeChange(value as TransactionType)}
      />

      <div className="grid gap-4 overflow-y-auto overscroll-y-contain pb-2">
        <AmountInput value={amount} onChange={setAmount} autoFocus={!initialTransaction} showKeyboard={false} />

        <CategoryPicker categories={categories} value={category} onChange={setCategory} />

        <label className={fieldClass}>
          <span>日期</span>
          <input
            className="w-full"
            type="date"
            value={occurredAt}
            max={maxDate}
            onChange={(event) => setOccurredAt(clampInputDateToMax(event.target.value, maxDate))}
          />
        </label>

        <label className={fieldClass}>
          <span>备注</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      <div>
        <AmountKeyboard value={amount} onChange={setAmount} />
      </div>
    </form>
  )
}
