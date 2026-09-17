import { parseBackup, type BackupData } from './backup'

type ImportResult = {
  data: BackupData
  kind: 'full-backup' | 'transactions'
  message: string
}

export async function parseImportFile(file: File): Promise<ImportResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    return {
      data: parseBackup(await file.text()),
      kind: 'full-backup',
      message: '导入完成。'
    }
  }

  if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
    throw new Error('不支持的导入文件格式')
  }

  const buffer = await file.arrayBuffer()
  const { parseExcelBackup, parseReadableTransactionsSheet } = await import('./excelBackup')
  const backupResult = parseExcelBackup(buffer)
  if (backupResult) {
    return {
      data: backupResult,
      kind: backupResult.includesSavingsData ? 'full-backup' : 'transactions',
      message: `导入完成：成功 ${backupResult.transactions.length} 条，跳过 ${backupResult.skipped} 条。`
    }
  }

  const readableResult = parseReadableTransactionsSheet(buffer)
  if (readableResult) {
    return {
      data: toTransactionOnlyBackup(readableResult),
      kind: 'transactions',
      message: `导入完成：成功 ${readableResult.transactions.length} 条，跳过 ${readableResult.skipped} 条。`
    }
  }

  throw new Error('Excel 文件格式不支持，请导入本应用导出的备份文件')
}

function toTransactionOnlyBackup(result: { transactions: BackupData['transactions']; skipped: number }): BackupData {
  return {
    transactions: result.transactions,
    savingsBuckets: [],
    savingsMovements: [],
    openingDisposableBalance: 0
  }
}
