type AmountInputProps = {
  value: string
  onChange: (value: string) => void
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <label className="field">
      <span>金额</span>
      <input
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
