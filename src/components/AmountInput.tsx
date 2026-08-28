import { parseAmountExpression } from '../lib/money'
import { fieldClass } from '../ui/classes'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  showKeyboard?: boolean
}

type AmountKeyboardProps = Pick<AmountInputProps, 'value' | 'onChange'>

const keyRows = [
  ['1', '2', '3', '+'],
  ['4', '5', '6', '-'],
  ['7', '8', '9', 'backspace'],
  ['.', '0', 'clear', 'equals']
]

export function AmountInput({ value, onChange, autoFocus = false, showKeyboard = true }: AmountInputProps) {
  const calculatedAmount = parseAmountExpression(value)
  const hasExpression = /[+-]/.test(value)
  const hasCalculatedResult = Number.isFinite(calculatedAmount)
  const amountResultClass = hasCalculatedResult
    ? 'min-h-[18px] text-sm font-bold text-emerald-600'
    : 'min-h-[18px] text-sm font-medium text-gray-400'

  return (
    <div className={`${fieldClass} gap-2.5`}>
      <label htmlFor="transaction-amount">金额</label>
      <div className="grid gap-1.5 [&_input]:text-2xl [&_input]:font-bold">
        <input
          id="transaction-amount"
          autoFocus={autoFocus}
          inputMode="none"
          pattern="[0-9+\-.\s]*"
          placeholder="0.00 或 1+2"
          readOnly
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {hasExpression && (
          <span className={amountResultClass}>
            {hasCalculatedResult ? `= ${formatAmount(calculatedAmount)}` : '算式未完成'}
          </span>
        )}
      </div>
      {showKeyboard && <AmountKeyboard value={value} onChange={onChange} />}
    </div>
  )
}

export function AmountKeyboard({ value, onChange }: AmountKeyboardProps) {
  function handleKeyPress(key: string) {
    if (key === 'backspace') {
      onChange(value.slice(0, -1))
      return
    }

    if (key === 'clear') {
      onChange('')
      return
    }

    if (key === 'equals') {
      const calculatedAmount = parseAmountExpression(value)
      if (Number.isFinite(calculatedAmount)) onChange(formatAmount(calculatedAmount))
      return
    }

    onChange(nextAmountExpression(value, key))
  }

  return (
    <div className="grid grid-cols-4 bg-red-900/90" aria-label="金额键盘">
      {keyRows.flat().map((key) => (
        <button
          key={key}
          type="button"
          className={amountKeyClass(key)}
          aria-label={keyLabel(key)}
          onClick={() => handleKeyPress(key)}
        >
          {keyText(key)}
        </button>
      ))}
    </div>
  )
}

function amountKeyClass(key: string): string {
  return key === 'equals'
    ? 'min-h-[46px] border border-gray-200 bg-gray-900 text-lg font-bold text-white'
    : 'min-h-[46px] border border-gray-200 bg-gray-50 text-lg font-bold'
}

function nextAmountExpression(current: string, key: string): string {
  if (key === '+' || key === '-') {
    if (!current || /[+-]$/.test(current)) {
      return current
    }

    return `${current}${key}`
  }

  if (key === '.') {
    const currentTerm = current.split(/[+-]/).at(-1) ?? ''
    if (currentTerm.includes('.')) {
      return current
    }
  }

  return `${current}${key}`
}

function formatAmount(amount: number): string {
  return String(Math.round(amount * 100) / 100)
}

function keyText(key: string): string {
  if (key === 'backspace') return '退'
  if (key === 'clear') return '清'
  if (key === 'equals') return '='
  return key
}

function keyLabel(key: string): string {
  if (key === 'backspace') return '删除一位'
  if (key === 'clear') return '清空金额'
  if (key === 'equals') return '计算金额'
  return `输入 ${key}`
}
