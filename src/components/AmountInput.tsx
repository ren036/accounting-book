import { parseAmountExpression } from '../lib/money'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

const keyRows = [
  ['1', '2', '3', '+'],
  ['4', '5', '6', '-'],
  ['7', '8', '9', 'backspace'],
  ['.', '0', 'clear', 'equals']
]

export function AmountInput({ value, onChange, autoFocus = false }: AmountInputProps) {
  const calculatedAmount = parseAmountExpression(value)
  const hasExpression = /[+-]/.test(value)
  const canShowResult = Number.isFinite(calculatedAmount) && calculatedAmount > 0

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
      if (canShowResult) {
        onChange(formatAmount(calculatedAmount))
      }
      return
    }

    onChange(nextAmountExpression(value, key))
  }

  return (
    <div className="field amount-field">
      <label htmlFor="transaction-amount">金额</label>
      <div className="amount-display">
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
        {/* {hasExpression && (
          <span className={`amount-result${canShowResult ? '' : ' invalid'}`}>
            {canShowResult ? `= ${formatAmount(calculatedAmount)}` : '算式未完成'}
          </span>
        )} */}
      </div>
      <div className="amount-keyboard" aria-label="金额键盘">
        {keyRows.flat().map((key) => (
          <button
            key={key}
            type="button"
            className={key === 'equals' ? 'amount-key action' : 'amount-key'}
            aria-label={keyLabel(key)}
            onClick={() => handleKeyPress(key)}
          >
            {keyText(key)}
          </button>
        ))}
      </div>
    </div>
  )
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
