import { parseBackup, type BackupData } from './backup'

type ImportResult = {
  data: BackupData
  message: string
}

export async function parseImportFile(file: File): Promise<ImportResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    return {
      data: parseBackup(await file.text()),
      message: '导入完成。'
    }
  }

  if (!fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
    throw new Error('不支持的导入文件格式')
  }

  const buffer = await file.arrayBuffer()
  const { parseExcelBackup } = await import('./excelBackup')
  const backupResult = parseExcelBackup(buffer)
  if (backupResult) {
    return {
      data: backupResult,
      message: `导入完成：成功 ${backupResult.transactions.length} 条，跳过 ${backupResult.skipped} 条。`
    }
  }

  throw new Error('Excel 文件格式不支持，请导入本应用导出的备份文件')
}
