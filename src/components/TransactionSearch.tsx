import { Search, X } from 'lucide-react'

type TransactionSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function TransactionSearch({ value, onChange }: TransactionSearchProps) {
  return (
    <div className="transaction-search">
      <Search aria-hidden="true" size={19} strokeWidth={2.2} />
      <input
        aria-label="搜索账单"
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索分类、备注、金额或日期"
        type="search"
        value={value}
      />
      {value && (
        <button aria-label="清空搜索" onClick={() => onChange('')} type="button">
          <X aria-hidden="true" size={18} />
        </button>
      )}
    </div>
  )
}
