import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { CategoryEmoji } from './CategoryEmoji'
import { expenseClass, incomeClass } from '../ui/classes'

type TransactionRowProps = {
  transaction: Transaction
  onOpen: (id: string) => void
}

export function TransactionRow({ transaction, onOpen }: TransactionRowProps) {
  const note = getTransactionNoteDisplay(transaction.note)
  const isIncome = transaction.type === 'income'
  const isExcludedFromBudget = !isIncome && transaction.includeInBudget === false

  return (
    <button className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-[18px] border p-3.5 text-left text-inherit ${isExcludedFromBudget ? 'border-amber-200 bg-amber-50/90' : 'border-transparent bg-white/90'}`} type="button" onClick={() => onOpen(transaction.id)}>
      <div className="inline-flex items-center gap-2 [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-gray-500">
        <CategoryEmoji category={transaction.category} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <strong>{transaction.category}</strong>
            {isExcludedFromBudget && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">非日常支出</span>}
          </div>
          {note && <p>{note}</p>}
        </div>
      </div>
      <div className={isIncome ? incomeClass : expenseClass}>
        {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
      </div>
    </button>
  )
}
