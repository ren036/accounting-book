import { useEffect, useRef, useState } from 'react'
import { expenseCategories, incomeCategories } from '../domain/categories'
import type { EditableTransactionFields, Transaction, TransactionType } from '../domain/transaction'
import { clampInputDateToMax, todayInputValue } from '../lib/dates'
import { parseAmountExpression } from '../lib/money'
import { AmountInput, AmountKeyboard } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { Switch, Toast } from 'antd-mobile'
import { fieldClass } from '../ui/classes'

type TransactionFormProps = {
  id?: string
  viewportHeight?: number
  initialTransaction?: Transaction
  onSubmit: (fields: EditableTransactionFields) => Promise<void>
}

export function TransactionForm({ id = 'transaction-form', viewportHeight = 0, initialTransaction, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialTransaction?.type ?? 'expense')
  const [amount, setAmount] = useState(initialTransaction ? String(initialTransaction.amount) : '')
  const [category, setCategory] = useState(initialTransaction?.category ?? expenseCategories[0])
  const [note, setNote] = useState(initialTransaction?.note ?? '')
  const [occurredAt, setOccurredAt] = useState(initialTransaction?.occurredAt.slice(0, 10) ?? todayInputValue())
  const [includeInBudget, setIncludeInBudget] = useState(initialTransaction ? initialTransaction.includeInBudget !== false : true)
  const [showAmountKeyboard, setShowAmountKeyboard] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const focusedFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

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
      occurredAt: `${clampInputDateToMax(occurredAt, maxDate)}T00:00:00.000Z`,
      includeInBudget: type === 'expense' && includeInBudget
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
    if (nextType === 'expense') setIncludeInBudget(true)
  }

  function showKeyboard() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setShowAmountKeyboard(true)
  }

  function handleNativeFieldFocus(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    focusedFieldRef.current = event.currentTarget
    setShowAmountKeyboard(false)
  }

  function handleNativeFieldBlur() {
    focusedFieldRef.current = null
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    const field = focusedFieldRef.current
    if (!container || !field || showAmountKeyboard) return

    const animationFrame = requestAnimationFrame(() => {
      const card = field.closest('label') ?? field
      const containerRect = container.getBoundingClientRect()
      const cardRect = card.getBoundingClientRect()
      const edgeSpacing = 12

      if (cardRect.bottom > containerRect.bottom - edgeSpacing) {
        container.scrollTop += cardRect.bottom - containerRect.bottom + edgeSpacing
      } else if (cardRect.top < containerRect.top + edgeSpacing) {
        container.scrollTop -= containerRect.top - cardRect.top + edgeSpacing
      }
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [showAmountKeyboard, viewportHeight])

  return (
    <form id={id} className="flex h-full min-h-0 flex-col overflow-hidden" onSubmit={handleSubmit}>
      <div className="mx-auto my-2 grid w-44 shrink-0 grid-cols-2 rounded-full bg-neutral-200/70 p-1">
        {(['expense', 'income'] as const).map((item) => (
          <button key={item} type="button" onClick={() => handleTypeChange(item)} className={`h-9 rounded-full border-0 text-sm transition-colors ${type === item ? 'bg-white font-semibold text-[var(--book-green)] shadow-sm' : 'bg-transparent text-neutral-500'}`}>
            {item === 'expense' ? '支出' : '收入'}
          </button>
        ))}
      </div>

      <div ref={scrollContainerRef} className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 pb-4 [&>*]:shrink-0">
        <AmountInput value={amount} onActivateKeyboard={showKeyboard} />

        <CategoryPicker categories={categories} value={category} onChange={setCategory} />

        <label className={`${fieldClass} scroll-mb-4`}>
          <span>日期</span>
          <input
            // className="w-full"
            type="date"
            value={occurredAt}
            max={maxDate}
            onFocus={handleNativeFieldFocus}
            onBlur={handleNativeFieldBlur}
            onChange={(event) => setOccurredAt(clampInputDateToMax(event.target.value, maxDate))}
          />
        </label>

        {type === 'expense' && (
          <label className={`${fieldClass} scroll-mb-4 grid-cols-[minmax(0,1fr)_auto] items-center`}>
            <span>
              <strong className="block">计入月度预算</strong>
              <small className="mt-1 block text-[var(--book-muted)]">关闭后，这笔支出不会占用预算</small>
            </span>
            <Switch checked={includeInBudget} onChange={setIncludeInBudget} aria-label="计入月度预算" />
          </label>
        )}

        <label className={`${fieldClass} scroll-mb-4`}>
          <span>备注</span>
          <textarea value={note} onFocus={handleNativeFieldFocus} onBlur={handleNativeFieldBlur} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      {showAmountKeyboard && (
        <div className="shrink-0 bg-white pb-[max(0px,env(safe-area-inset-bottom))]">
          <AmountKeyboard
            value={amount}
            onChange={setAmount}
            onDismiss={() => setShowAmountKeyboard(false)}
            onSubmit={() => document.getElementById(id)?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))}
          />
        </div>
      )}
    </form>
  )
}
