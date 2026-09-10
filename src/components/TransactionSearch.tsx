import { Search, X } from 'lucide-react'
import { ActionIcon, TextInput } from '@mantine/core'

type TransactionSearchProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function TransactionSearch({ value, onChange, autoFocus = false }: TransactionSearchProps) {
  return (
    <TextInput
        autoFocus={autoFocus}
        aria-label="搜索账单"
        leftSection={<Search aria-hidden="true" size={19} strokeWidth={2.2} />}
        rightSection={value ? (
          <ActionIcon color="teal" variant="light" radius="xl" size="sm" aria-label="清空搜索" onClick={() => onChange('')}>
            <X aria-hidden="true" size={15} />
          </ActionIcon>
        ) : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索分类、备注、金额或日期"
        type="search"
        value={value}
        radius="lg"
        size="md"
      />
  )
}
