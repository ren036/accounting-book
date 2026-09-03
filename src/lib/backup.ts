import { normalizeSavingsBucketStatus, type SavingsBucket, type SavingsMovement } from '../domain/savings'
import type { Transaction } from '../domain/transaction'
import { formatOccurredAtForExport } from './dates'

type LegacyBackupTransaction = Transaction & {
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  syncStatus?: string
  savingsMovementId?: string
}

type LegacyBackupBucket = Omit<SavingsBucket, 'status'> & { status: SavingsBucket['status'] | 'completed' | 'consumed' | 'archived' }
type LegacyBackupMovement = SavingsMovement & { linkedTransactionId?: string }

type BackupFileV1 = {
  version: 1
  exportedAt: string
  transactions: LegacyBackupTransaction[]
}

type BackupFileV2 = {
  version: 2
  exportedAt: string
  transactions: Transaction[]
  savingsBuckets: SavingsBucket[]
  savingsMovements: SavingsMovement[]
  openingDisposableBalance: number
}

export type BackupData = {
  transactions: Transaction[]
  savingsBuckets: SavingsBucket[]
  savingsMovements: SavingsMovement[]
  openingDisposableBalance: number
}

export function serializeBackup(data: BackupData): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      transactions: data.transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note,
        occurredAt: formatOccurredAtForExport(transaction.occurredAt),
        includeInBudget: transaction.includeInBudget
      })),
      savingsBuckets: data.savingsBuckets,
      savingsMovements: data.savingsMovements.map((movement) => ({
        ...movement,
        occurredAt: formatOccurredAtForExport(movement.occurredAt)
      })),
      openingDisposableBalance: data.openingDisposableBalance
    } satisfies BackupFileV2,
    null,
    2
  )
}

export function parseBackup(content: string): BackupData {
  const parsed = JSON.parse(content) as BackupFileV1 | BackupFileV2

  if ((parsed.version !== 1 && parsed.version !== 2) || !Array.isArray(parsed.transactions)) {
    throw new Error('备份文件格式不正确')
  }

  const transactions = (parsed.transactions as LegacyBackupTransaction[])
    .filter((transaction) => transaction.deletedAt == null)
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      occurredAt: transaction.occurredAt,
      includeInBudget: transaction.type === 'expense' && transaction.includeInBudget !== false
    }))

  if (parsed.version === 1) {
    return { transactions, savingsBuckets: [], savingsMovements: [], openingDisposableBalance: 0 }
  }

  if (!Array.isArray(parsed.savingsBuckets) || !Array.isArray(parsed.savingsMovements)) {
    throw new Error('备份文件中的储蓄数据格式不正确')
  }

  return {
    transactions,
    savingsBuckets: (parsed.savingsBuckets as LegacyBackupBucket[]).map((bucket) => ({
      id: bucket.id,
      kind: bucket.kind,
      name: bucket.name,
      targetAmount: bucket.targetAmount,
      targetDate: bucket.targetDate,
      createdAt: bucket.createdAt,
      status: normalizeSavingsBucketStatus(bucket.status)
    })),
    savingsMovements: (parsed.savingsMovements as LegacyBackupMovement[]).map((movement) => ({
      id: movement.id,
      bucketId: movement.bucketId,
      type: movement.type,
      amount: movement.amount,
      occurredAt: movement.occurredAt,
      note: movement.note
    })),
    openingDisposableBalance: Number.isFinite(parsed.openingDisposableBalance)
      ? parsed.openingDisposableBalance
      : 0
  }
}
