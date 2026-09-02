import Dexie, { type Table } from 'dexie'
import type { Transaction } from '../domain/transaction'
import type { MonthlyBudget } from '../domain/budget'

type StoredTransaction = Omit<Transaction, 'includeInBudget'> & {
  includeInBudget?: boolean
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  syncStatus?: string
}

type AppPreference = {
  key: string
  value: string
}

class AccountingDatabase extends Dexie {
  transactions!: Table<Transaction, string>
  budgets!: Table<MonthlyBudget, string>
  preferences!: Table<AppPreference, string>

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
            occurredAt: record.occurredAt,
            includeInBudget: record.type === 'expense'
          }))
      )
    })
    this.version(3).stores({
      transactions: 'id, type, category, occurredAt',
      budgets: 'month'
    }).upgrade(async (transaction) => {
      await transaction.table<Transaction, string>('transactions').toCollection().modify((record) => {
        record.includeInBudget = record.type === 'expense'
      })
    })
    this.version(4).stores({
      transactions: 'id, type, category, occurredAt',
      budgets: 'month',
      preferences: 'key'
    })
  }
}

const db = new AccountingDatabase()

export async function listTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy('occurredAt').reverse().toArray()
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  await db.transactions.put(transaction)
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await db.transactions.bulkPut(transactions)
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id)
}

export async function clearTransactions(): Promise<void> {
  await db.transactions.clear()
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.transactions, db.budgets, db.preferences, async () => {
    await db.transactions.clear()
    await db.budgets.clear()
    await db.preferences.clear()
  })
}

export async function listBudgets(): Promise<MonthlyBudget[]> {
  return db.budgets.orderBy('month').reverse().toArray()
}

export async function saveBudget(budget: MonthlyBudget): Promise<void> {
  await db.budgets.put(budget)
}

export async function deleteBudget(month: string): Promise<void> {
  await db.budgets.delete(month)
}

export async function getPreference(key: string): Promise<string | null> {
  return (await db.preferences.get(key))?.value ?? null
}

export async function setPreference(key: string, value: string | null): Promise<void> {
  if (value === null) {
    await db.preferences.delete(key)
    return
  }
  await db.preferences.put({ key, value })
}
