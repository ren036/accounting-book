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
