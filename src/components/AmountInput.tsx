import { Check, Delete } from 'lucide-react'
import { parseAmountExpression } from '../lib/money'

type AmountInputProps = { value: string; onChange: (value: string) => void; autoFocus?: boolean; showKeyboard?: boolean; onActivateKeyboard?: () => void }
type AmountKeyboardProps = Pick<AmountInputProps, 'value' | 'onChange'> & { onSubmit?: () => void }

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace']

export function AmountInput({ value, onChange, showKeyboard = true, onActivateKeyboard }: AmountInputProps) {
  const calculated = parseAmountExpression(value)
  const hasExpression = /[+-]/.test(value)

  return (
    <section
      className="rounded-[var(--book-radius-card)] bg-white p-5 shadow-[var(--book-shadow-card)]"
      aria-label="金额输入区，点击显示数字键盘"
      onClick={onActivateKeyboard}
    >
      <span className="text-sm text-[var(--book-muted)]">金额</span>
      <div className="mt-3 flex items-end gap-2 border-b border-neutral-100 pb-4">
        <span className="pb-1 text-2xl font-semibold">¥</span>
        <output className="min-w-0 flex-1 truncate text-right text-[40px] font-semibold leading-none tracking-tight" aria-label={`金额 ${value || '0'}`}>
          {value || '0'}
        </output>
      </div>
      {hasExpression && <p className="m-0 mt-2 text-right text-sm font-semibold text-[var(--book-green)]">{Number.isFinite(calculated) ? `= ${formatAmount(calculated)}` : '算式未完成'}</p>}
      {showKeyboard && <AmountKeyboard value={value} onChange={onChange} />}
    </section>
  )
}

export function AmountKeyboard({ value, onChange, onSubmit }: AmountKeyboardProps) {
  function press(key: string) {
    if (key === 'backspace') return onChange(value.slice(0, -1))
    onChange(nextAmountExpression(value, key))
  }

  return (
    <section className="bg-white pt-3" aria-label="金额键盘">
      <div className={`grid gap-2 ${onSubmit ? 'grid-cols-[3fr_1fr]' : ''}`}>
        <div className="grid grid-cols-3 gap-2">
          {keys.map((key) => (
            <button key={key} type="button" aria-label={key === 'backspace' ? '删除一位' : `输入 ${key}`} onClick={() => press(key)} className="grid min-h-12 place-items-center rounded-2xl border-0 bg-neutral-100 text-xl font-medium text-neutral-800 transition-[transform,background-color] duration-100 active:scale-[.97] active:bg-neutral-200">
              {key === 'backspace' ? <Delete aria-hidden size={22} /> : key}
            </button>
          ))}
        </div>
        {onSubmit && (
          <button type="button" onClick={onSubmit} className="flex min-h-0 flex-col items-center justify-center gap-2 rounded-2xl border-0 bg-[var(--book-green)] font-semibold text-white transition active:scale-[.98] active:bg-[var(--book-green-dark)]">
            <Check aria-hidden size={25} />完成
          </button>
        )}
      </div>
    </section>
  )
}

function nextAmountExpression(current: string, key: string): string {
  if (key === '+' || key === '-') return !current || /[+-]$/.test(current) ? current : `${current}${key}`
  if (key === '.') {
    const term = current.split(/[+-]/).at(-1) ?? ''
    if (term.includes('.')) return current
  }
  const decimal = current.split(/[+-]/).at(-1)?.split('.')[1]
  if (decimal?.length === 2) return current
  if (current === '0' && key !== '.') return key
  return `${current}${key}`
}

function formatAmount(amount: number): string { return String(Math.round(amount * 100) / 100) }
