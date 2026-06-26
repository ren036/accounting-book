import NumberKeyboard from 'antd-mobile/es/components/number-keyboard'
import { useEffect, useState } from 'react'

type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function AmountInput({ value, onChange, autoFocus = false }: AmountInputProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    if (autoFocus) setKeyboardVisible(true)
  }, [autoFocus])

  return (
    <label className="field">
      <span>金额</span>
      <input
        autoFocus={autoFocus}
        readOnly
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onClick={() => setKeyboardVisible(true)}
        onFocus={() => setKeyboardVisible(true)}
      />
      <NumberKeyboard
        visible={keyboardVisible}
        customKey={['.', '+']}
        confirmText="完成"
        onInput={(key) => onChange(`${value}${key}`)}
        onDelete={() => onChange(value.slice(0, -1))}
        onClose={() => setKeyboardVisible(false)}
        onConfirm={() => setKeyboardVisible(false)}
      />
    </label>
  )
}
