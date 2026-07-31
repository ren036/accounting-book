import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { CategoryEmoji } from './CategoryEmoji'

type TransactionRowProps = {
  transaction: Transaction
  onEdit: (id: string) => void
}

export function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const note = getTransactionNoteDisplay(transaction.note)
  const isIncome = transaction.type === 'income'

  return (
    <button className="transaction transaction-button" type="button" onClick={() => onEdit(transaction.id)}>
      <div className="icon-label">
        <CategoryEmoji category={transaction.category} />
        <div>
          <strong>{transaction.category}</strong>
          {note && <p>{note}</p>}
        </div>
      </div>
      <div className={isIncome ? 'income' : 'expense'}>
        {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
      </div>
    </button>
  )
}
