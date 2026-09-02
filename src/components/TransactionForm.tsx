import { useState } from 'react'
import { expenseCategories, incomeCategories } from '../domain/categories'
import type { EditableTransactionFields, Transaction, TransactionType } from '../domain/transaction'
import { clampInputDateToMax, todayInputValue } from '../lib/dates'
import { parseAmountExpression } from '../lib/money'
import { AmountInput, AmountKeyboard } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { Toast } from 'antd-mobile'
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
  const [showAmountKeyboard, setShowAmountKeyboard] = useState(true)

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const maxDate = todayInputValue()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const numericAmount = parseAmountExpression(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Toast.show({ content: '请输入大于 0 的金额' })
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

  function showKeyboard() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setShowAmountKeyboard(true)
  }

  return (
    <form id={id} className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3" onSubmit={handleSubmit}>
      <div className="mx-auto grid w-44 grid-cols-2 rounded-full bg-neutral-200/70 p-1">
        {(['expense', 'income'] as const).map((item) => (
          <button key={item} type="button" onClick={() => handleTypeChange(item)} className={`h-9 rounded-full border-0 text-sm transition-colors ${type === item ? 'bg-white font-semibold text-[var(--book-green)] shadow-sm' : 'bg-transparent text-neutral-500'}`}>
            {item === 'expense' ? '支出' : '收入'}
          </button>
        ))}
      </div>

      <div className="grid content-start gap-3 overflow-y-auto overscroll-y-contain pb-2">
        <AmountInput value={amount} onChange={setAmount} autoFocus={!initialTransaction} showKeyboard={false} onActivateKeyboard={showKeyboard} />

        <CategoryPicker categories={categories} value={category} onChange={setCategory} />

        <label className={fieldClass}>
          <span>日期</span>
          <input
            className="w-full"
            type="date"
            value={occurredAt}
            max={maxDate}
            onFocus={() => setShowAmountKeyboard(false)}
            onChange={(event) => setOccurredAt(clampInputDateToMax(event.target.value, maxDate))}
          />
        </label>

        <label className={fieldClass}>
          <span>备注</span>
          <textarea value={note} onFocus={() => setShowAmountKeyboard(false)} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      {showAmountKeyboard && (
        <div className="bg-white pb-[max(0px,env(safe-area-inset-bottom))]">
          <AmountKeyboard value={amount} onChange={setAmount} onSubmit={() => document.getElementById(id)?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))} />
        </div>
      )}
    </form>
  )
}
