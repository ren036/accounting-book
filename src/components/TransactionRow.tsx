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

  return (
    <button className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[18px] border-0 bg-white/90 p-3.5 text-left text-inherit" type="button" onClick={() => onOpen(transaction.id)}>
      <div className="inline-flex items-center gap-2 [&_p]:mt-1 [&_p]:mb-0 [&_p]:text-gray-500">
        <CategoryEmoji category={transaction.category} />
        <div>
          <strong>{transaction.category}</strong>
          {note && <p>{note}</p>}
        </div>
      </div>
      <div className={isIncome ? incomeClass : expenseClass}>
        {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
      </div>
    </button>
  )
}
