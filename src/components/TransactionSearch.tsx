import { Search, X } from 'lucide-react'

type TransactionSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function TransactionSearch({ value, onChange }: TransactionSearchProps) {
  return (
    <div className="grid min-h-[46px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[9px] rounded-2xl border border-gray-200 bg-white/90 px-3 text-gray-500 shadow-[0_8px_24px_rgb(15_23_42/6%)] [&_input]:w-full [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:py-[11px] [&_input]:text-base [&_input]:text-gray-900 [&_input]:outline-0 [&_input::-webkit-search-cancel-button]:hidden [&_button]:grid [&_button]:h-[30px] [&_button]:w-[30px] [&_button]:place-items-center [&_button]:rounded-full [&_button]:border-0 [&_button]:bg-indigo-50 [&_button]:p-0 [&_button]:text-gray-600">
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
