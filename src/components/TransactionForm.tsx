import { useEffect, useRef, useState } from 'react'
import { expenseCategories, incomeCategories } from '../domain/categories'
import type { EditableTransactionFields, Transaction, TransactionType } from '../domain/transaction'
import { clampInputDateToMax, combineDateWithTime, todayInputValue } from '../lib/dates'
import { parseAmountExpression } from '../lib/money'
import { AmountInput, AmountKeyboard } from './AmountInput'
import { CategoryPicker } from './CategoryPicker'
import { Box, Divider, Flex, Paper, SegmentedControl, Stack, Switch, Textarea, TextInput } from '@mantine/core'
import { showMessage } from '../ui/feedback'

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
      showMessage('请输入大于 0 的金额')
      return
    }

    const selectedDate = clampInputDateToMax(occurredAt, maxDate)
    const fields = {
      type,
      amount: Math.round(numericAmount * 100) / 100,
      category,
      note: note.trim(),
      occurredAt: combineDateWithTime(selectedDate, initialTransaction?.occurredAt),
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
    <Flex component="form" id={id} direction="column" h="100%" mih={0} style={{ overflow: 'hidden' }} onSubmit={handleSubmit}>
      <SegmentedControl
        w={176}
        mx="auto"
        my="xs"
        value={type}
        data={[{ label: '支出', value: 'expense' }, { label: '收入', value: 'income' }]}
        onChange={(value) => handleTypeChange(value as TransactionType)}
      />

      <Stack ref={scrollContainerRef} flex={1} mih={0} gap="xs" px="md" pb="md" style={{ overflowX: 'hidden', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <AmountInput value={amount} onActivateKeyboard={showKeyboard} />

        <CategoryPicker categories={categories} value={category} onChange={setCategory} />

        <Paper p="md" style={{ scrollMarginBottom: 16 }}>
          <Stack gap="md">
            <TextInput
              label="日期"
              type="date"
              value={occurredAt}
              max={maxDate}
              onFocus={handleNativeFieldFocus}
              onBlur={handleNativeFieldBlur}
              onChange={(event) => setOccurredAt(clampInputDateToMax(event.target.value, maxDate))}
            />
            {type === 'expense' && (
              <>
                <Divider />
            <Switch
              checked={includeInBudget}
              onChange={(event) => setIncludeInBudget(event.currentTarget.checked)}
              aria-label="计入日常消费"
              label="计入日常消费"
              description="关闭后仍会记账并减少可支配金额，但不进入日常消费和预算"
              labelPosition="left"
              w="100%"
            />
              </>
            )}
            <Divider />
            <Textarea label="备注" value={note} autosize minRows={2} maxRows={3} onFocus={handleNativeFieldFocus} onBlur={handleNativeFieldBlur} onChange={(event) => setNote(event.target.value)} />
          </Stack>
        </Paper>
      </Stack>

      {showAmountKeyboard && (
        <Box bg="white" pb="env(safe-area-inset-bottom)" style={{ flexShrink: 0 }}>
          <AmountKeyboard
            value={amount}
            onChange={setAmount}
            onDismiss={() => setShowAmountKeyboard(false)}
            onSubmit={() => document.getElementById(id)?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))}
          />
        </Box>
      )}
    </Flex>
  )
}
