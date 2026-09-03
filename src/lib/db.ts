import Dexie, { type Table } from 'dexie'
import type { Transaction } from '../domain/transaction'
import type { MonthlyBudget } from '../domain/budget'
import { createGeneralSavingsBucket, GENERAL_SAVINGS_BUCKET_ID, normalizeSavingsBucketStatus, type SavingsBucket, type SavingsMovement } from '../domain/savings'

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

type LegacyLinkedTransaction = Transaction & { savingsMovementId?: string }
type LegacyLinkedMovement = SavingsMovement & { linkedTransactionId?: string }
type LegacySavingsBucket = Omit<SavingsBucket, 'status'> & { status: SavingsBucket['status'] | 'completed' | 'consumed' | 'archived' }

class AccountingDatabase extends Dexie {
  transactions!: Table<Transaction, string>
  budgets!: Table<MonthlyBudget, string>
  preferences!: Table<AppPreference, string>
  savingsBuckets!: Table<SavingsBucket, string>
  savingsMovements!: Table<SavingsMovement, string>

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
    this.version(5).stores({
      transactions: 'id, type, category, occurredAt',
      budgets: 'month',
      preferences: 'key',
      savingsBuckets: 'id, kind, status, createdAt',
      savingsMovements: 'id, bucketId, type, occurredAt'
    })
    this.version(6).stores({
      transactions: 'id, type, category, occurredAt',
      budgets: 'month',
      preferences: 'key',
      savingsBuckets: 'id, kind, status, createdAt',
      savingsMovements: 'id, bucketId, type, occurredAt'
    }).upgrade(async (transaction) => {
      await transaction.table<LegacyLinkedTransaction, string>('transactions').toCollection().modify((record) => {
        delete record.savingsMovementId
      })
      await transaction.table<LegacyLinkedMovement, string>('savingsMovements').toCollection().modify((record) => {
        delete record.linkedTransactionId
      })
      await transaction.table<LegacySavingsBucket, string>('savingsBuckets').toCollection().modify((record) => {
        if (record.status === 'archived') record.status = 'completed'
      })
    })
    this.version(8).stores({
      transactions: 'id, type, category, occurredAt',
      budgets: 'month',
      preferences: 'key',
      savingsBuckets: 'id, kind, status, createdAt',
      savingsMovements: 'id, bucketId, type, occurredAt'
    })
    this.version(9).stores({
      transactions: 'id, type, category, occurredAt',
      budgets: 'month',
      preferences: 'key',
      savingsBuckets: 'id, kind, status, createdAt',
      savingsMovements: 'id, bucketId, type, occurredAt'
    }).upgrade(async (transaction) => {
      await transaction.table<LegacySavingsBucket, string>('savingsBuckets').toCollection().modify((record) => {
        record.status = normalizeSavingsBucketStatus(record.status)
      })
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
  await db.transaction('rw', db.transactions, db.budgets, db.preferences, db.savingsBuckets, db.savingsMovements, async () => {
    await db.transactions.clear()
    await db.budgets.clear()
    await db.preferences.clear()
    await db.savingsBuckets.clear()
    await db.savingsMovements.clear()
  })
}

export async function listSavingsBuckets(): Promise<SavingsBucket[]> {
  return db.savingsBuckets.orderBy('createdAt').toArray()
}

export async function ensureGeneralSavingsBucket(): Promise<SavingsBucket> {
  const existing = await db.savingsBuckets.get(GENERAL_SAVINGS_BUCKET_ID)
  if (existing) return existing
  const bucket = createGeneralSavingsBucket()
  await db.savingsBuckets.put(bucket)
  return bucket
}

export async function saveSavingsBucket(bucket: SavingsBucket, refundMovement?: SavingsMovement): Promise<void> {
  if (!refundMovement) {
    await db.savingsBuckets.put(bucket)
    return
  }
  await db.transaction('rw', db.savingsBuckets, db.savingsMovements, async () => {
    await db.savingsBuckets.put(bucket)
    await db.savingsMovements.put(refundMovement)
  })
}

export async function saveSavingsBuckets(buckets: SavingsBucket[]): Promise<void> {
  await db.savingsBuckets.bulkPut(buckets)
}

export async function listSavingsMovements(): Promise<SavingsMovement[]> {
  return db.savingsMovements.orderBy('occurredAt').reverse().toArray()
}

export async function saveSavingsMovement(movement: SavingsMovement): Promise<void> {
  await db.savingsMovements.put(movement)
}

export async function saveSavingsMovements(movements: SavingsMovement[]): Promise<void> {
  await db.savingsMovements.bulkPut(movements)
}

export async function deleteSavingsMovement(id: string): Promise<void> {
  await db.savingsMovements.delete(id)
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
