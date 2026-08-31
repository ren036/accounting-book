import { parseAmountExpression } from '../lib/money'
import { fieldClass } from '../ui/classes'
import { Delete } from 'lucide-react'

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
    <div className={`${fieldClass}`}>
      <label htmlFor="transaction-amount">金额</label>
      <div className="[&_input]:text-xl [&_input]:font-bold">
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
    <div
      className="grid grid-cols-4 gap-2 rounded-[24px] border border-white/80 bg-slate-100/90 p-2.5 shadow-[0_14px_32px_rgb(15_23_42/10%),inset_0_1px_0_rgb(255_255_255/90%)]"
      aria-label="金额键盘"
    >
      {keyRows.flat().map((key) => (
        <button
          key={key}
          type="button"
          className={amountKeyClass(key)}
          aria-label={keyLabel(key)}
          onClick={() => handleKeyPress(key)}
        >
          {key === 'backspace' ? <Delete aria-hidden="true" size={22} strokeWidth={2.25} /> : keyText(key)}
        </button>
      ))}
    </div>
  )
}

function amountKeyClass(key: string): string {
  const baseClass = 'flex min-h-[50px] select-none items-center justify-center rounded-[16px] border text-xl font-semibold leading-none transition-[transform,box-shadow,background-color] duration-100 active:translate-y-px active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'

  if (key === 'equals') {
    return `${baseClass} border-indigo-500 bg-[linear-gradient(145deg,#6366f1,#4f46e5)] text-white shadow-[0_5px_12px_rgb(79_70_229/30%)]`
  }

  if (key === 'clear') {
    return `${baseClass} border-rose-100 bg-rose-50 text-[15px] font-bold tracking-wide text-rose-600 shadow-[0_3px_8px_rgb(225_29_72/9%)]`
  }

  if (key === '+' || key === '-') {
    return `${baseClass} border-indigo-100 bg-indigo-50 text-2xl text-indigo-600 shadow-[0_3px_8px_rgb(79_70_229/10%)]`
  }

  if (key === 'backspace') {
    return `${baseClass} border-slate-200 bg-slate-200/70 text-slate-600 shadow-[0_3px_8px_rgb(15_23_42/8%)]`
  }

  return `${baseClass} border-white bg-white text-slate-800 shadow-[0_3px_9px_rgb(15_23_42/10%)]`
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
  if (key === 'clear') return 'AC'
  if (key === 'equals') return '='
  return key
}

function keyLabel(key: string): string {
  if (key === 'backspace') return '删除一位'
  if (key === 'clear') return '清空金额'
  if (key === 'equals') return '计算金额'
  return `输入 ${key}`
}
