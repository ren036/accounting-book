import Dexie, { type Table } from 'dexie'
import type { Transaction } from '../domain/transaction'

type StoredTransaction = Transaction & {
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  syncStatus?: string
}

class AccountingDatabase extends Dexie {
  transactions!: Table<Transaction, string>

  constructor() {
    super('accounting-book')
    this.version(1).stores({
      transactions: 'id, type, category, occurredAt, updatedAt, syncStatus, deletedAt'
    })
    this.version(2).stores({
      transactions: 'id, type, category, occurredAt'
    }).upgrade(async (transaction) => {
      const table = transaction.table<StoredTransaction, string>('transactions')
      const records = await table.toArray()

      await table.clear()
      await table.bulkPut(
        records
          .filter((record) => record.deletedAt == null)
          .map((record) => ({
            id: record.id,
            type: record.type,
            amount: record.amount,
            category: record.category,
            note: record.note,
            occurredAt: record.occurredAt
          }))
      )
    })
  }
}

export const db = new AccountingDatabase()

export async function listTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy('occurredAt').reverse().toArray()
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  return db.transactions.get(id)
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  await db.transactions.put(transaction)
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id)
}

export async function clearTransactions(): Promise<void> {
  await db.transactions.clear()
}
