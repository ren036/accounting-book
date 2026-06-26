type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function AmountInput({ value, onChange, autoFocus = false }: AmountInputProps) {
  return (
    <label className="field">
      <span>金额</span>
      <input
        autoFocus={autoFocus}
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
