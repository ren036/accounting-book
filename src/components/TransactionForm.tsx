import DatePicker from 'antd-mobile/es/components/date-picker'
import { useState } from 'react'
import { expenseCategories, incomeCategories } from '../domain/categories'
import type { EditableTransactionFields, Transaction, TransactionType } from '../domain/transaction'
import { todayInputValue } from '../lib/dates'
import { AmountInput } from './AmountInput'

type TransactionFormProps = {
  initialTransaction?: Transaction
  submitText?: string
  onSubmit: (transaction: Transaction | EditableTransactionFields) => Promise<void>
}

export function TransactionForm({ initialTransaction, submitText = '保存', onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialTransaction?.type ?? 'expense')
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : '')
  const [category, setCategory] = useState(initialTransaction?.category ?? expenseCategories[0])
  const [note, setNote] = useState(initialTransaction?.note ?? '')
  const [occurredAt, setOccurredAt] = useState(initialTransaction?.occurredAt.slice(0, 10) ?? todayInputValue())

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const selectedDate = inputValueToDate(occurredAt)
  const maxDate = inputValueToDate(todayInputValue())

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
      occurredAt: `${occurredAt}T00:00:00.000Z`
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
    <form className="card form" onSubmit={handleSubmit}>
      <div className="segmented">
        <button type="button" className={type === 'expense' ? 'active' : ''} onClick={() => handleTypeChange('expense')}>
          支出
        </button>
        <button type="button" className={type === 'income' ? 'active' : ''} onClick={() => handleTypeChange('income')}>
          收入
        </button>
      </div>

      <AmountInput value={amount} onChange={setAmount} autoFocus={!initialTransaction} />

      <label className="field">
        <span>分类</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>

      <div className="field">
        <span>日期</span>
        <DatePicker
          title="选择日期"
          precision="day"
          value={selectedDate}
          max={maxDate}
          onConfirm={(value) => setOccurredAt(dateToInputValue(value))}
        >
          {(_, actions) => (
            <button className="date-picker-trigger" type="button" onClick={actions.open}>
              {occurredAt}
            </button>
          )}
        </DatePicker>
      </div>

      <label className="field">
        <span>备注</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} />
      </label>

      <button className="primary" type="submit">
        {submitText}
      </button>
    </form>
  )
}

function inputValueToDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dateToInputValue(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
