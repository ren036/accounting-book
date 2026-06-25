import type { Transaction } from '../domain/transaction'

type BackupFile = {
  version: 1
  exportedAt: string
  transactions: BackupTransaction[]
}

type BackupTransaction = Transaction & {
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  syncStatus?: string
}

export function serializeBackup(transactions: Transaction[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions
    } satisfies BackupFile,
    null,
    2
  )
}

export function parseBackup(content: string): Transaction[] {
  const parsed = JSON.parse(content) as BackupFile

  if (parsed.version !== 1 || !Array.isArray(parsed.transactions)) {
    throw new Error('备份文件格式不正确')
  }

  return parsed.transactions
    .filter((transaction) => transaction.deletedAt == null)
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      occurredAt: transaction.occurredAt
    }))
}
