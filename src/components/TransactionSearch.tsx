import { Search, X } from 'lucide-react'

type TransactionSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function TransactionSearch({ value, onChange }: TransactionSearchProps) {
  return (
    <div className="grid min-h-[46px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[9px] rounded-2xl border border-[var(--book-border)] bg-[var(--book-card)]/95 px-3 text-[var(--book-muted)] shadow-[var(--book-shadow-card)] [&_input]:w-full [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:py-[11px] [&_input]:text-base [&_input]:text-[var(--book-text)] [&_input]:outline-0 [&_input::-webkit-search-cancel-button]:hidden [&_button]:grid [&_button]:h-[30px] [&_button]:w-[30px] [&_button]:place-items-center [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-[var(--book-green-soft)] [&_button]:p-0 [&_button]:text-[var(--book-green)]">
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
