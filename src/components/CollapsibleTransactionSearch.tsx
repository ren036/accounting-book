import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { TransactionSearch } from './TransactionSearch'

type CollapsibleTransactionSearchProps = {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

export function CollapsibleTransactionSearch({ value, onChange, children }: CollapsibleTransactionSearchProps) {
  const [expanded, setExpanded] = useState(false)
  const searchId = useId()

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          className="flex min-h-9 shrink-0 items-center gap-1 rounded-full border-0 bg-transparent px-2 text-xs text-[var(--book-green-dark)]"
          aria-expanded={expanded}
          aria-controls={searchId}
          onClick={() => {
            setExpanded(!expanded)
            if (expanded) onChange('')
          }}
        >
          {expanded ? <X size={16} aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
          {expanded ? '收起搜索' : '搜索'}
        </button>
      </div>
      <div id={searchId} hidden={!expanded}>
        {expanded && <TransactionSearch value={value} onChange={onChange} autoFocus />}
      </div>
    </div>
  )
}
