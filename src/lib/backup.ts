import { isSavingsBucketStatus, type SavingsBucket, type SavingsMovement } from '../domain/savings'
import type { Transaction } from '../domain/transaction'
import { formatLocalDateTime, isSupportedOccurredAt } from './dates'

type BackupFile = {
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
      exportedAt: formatLocalDateTime(),
      transactions: data.transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note,
        occurredAt: requireSupportedOccurredAt(transaction.occurredAt),
        includeInBudget: transaction.includeInBudget
      })),
      savingsBuckets: data.savingsBuckets.map((bucket) => ({
        ...bucket,
        createdAt: requireSupportedOccurredAt(bucket.createdAt)
      })),
      savingsMovements: data.savingsMovements.map((movement) => ({
        ...movement,
        occurredAt: requireSupportedOccurredAt(movement.occurredAt)
      })),
      openingDisposableBalance: data.openingDisposableBalance
    } satisfies BackupFile,
    null,
    2
  )
}

export function parseBackup(content: string): BackupData {
  const parsed = JSON.parse(content) as BackupFile

  if (parsed.version !== 2 || !Array.isArray(parsed.transactions)) {
    throw new Error('备份文件格式不正确')
  }
  requireSupportedOccurredAt(parsed.exportedAt)

  const transactions = parsed.transactions
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      occurredAt: requireSupportedOccurredAt(transaction.occurredAt),
      includeInBudget: transaction.includeInBudget
    }))

  if (!Array.isArray(parsed.savingsBuckets) || !Array.isArray(parsed.savingsMovements)) {
    throw new Error('备份文件中的储蓄数据格式不正确')
  }

  return {
    transactions,
    savingsBuckets: parsed.savingsBuckets.map((bucket) => ({
      id: bucket.id,
      kind: bucket.kind,
      name: bucket.name,
      targetAmount: bucket.targetAmount,
      targetDate: bucket.targetDate,
      createdAt: requireSupportedOccurredAt(bucket.createdAt),
      status: requireSavingsBucketStatus(bucket.status)
    })),
    savingsMovements: parsed.savingsMovements.map((movement) => ({
      id: movement.id,
      bucketId: movement.bucketId,
      type: movement.type,
      amount: movement.amount,
      occurredAt: requireSupportedOccurredAt(movement.occurredAt),
      note: movement.note
    })),
    openingDisposableBalance: Number.isFinite(parsed.openingDisposableBalance)
      ? parsed.openingDisposableBalance
      : 0
  }
}

function requireSupportedOccurredAt(value: unknown): string {
  const occurredAt = String(value ?? '').trim()
  if (!isSupportedOccurredAt(occurredAt)) {
    throw new Error('备份文件包含不支持的日期时间格式，只支持 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss')
  }
  return occurredAt
}

function requireSavingsBucketStatus(value: unknown): SavingsBucket['status'] {
  if (!isSavingsBucketStatus(value)) throw new Error('备份文件包含不支持的储蓄状态')
  return value
}
