export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  category: string
  note: string
  occurredAt: string
}

export type EditableTransactionFields = Pick<Transaction, 'type' | 'amount' | 'category' | 'note' | 'occurredAt'>

export function updateTransaction(
  transaction: Transaction,
  fields: EditableTransactionFields
): Transaction {
  return {
    ...transaction,
    ...fields
  }
}

export function getTransactionNoteDisplay(note: string): string | null {
  const trimmed = note.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function searchTransactions(transactions: Transaction[], query: string): Transaction[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)

  if (terms.length === 0) return transactions

  return transactions.filter((transaction) => {
    const typeLabel = transaction.type === 'income' ? '收入 income' : '支出 expense'
    const searchableText = [
      transaction.category,
      transaction.note,
      String(transaction.amount),
      transaction.amount.toFixed(2),
      transaction.occurredAt.slice(0, 10),
      typeLabel
    ].join(' ').toLocaleLowerCase()

    return terms.every((term) => searchableText.includes(term))
  })
}
