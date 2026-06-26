import { useState } from 'react'
import { Dialog } from 'antd-mobile'
import { parseBackup, serializeBackup } from '../lib/backup'
import { createBackupFileName } from '../lib/backupFileName'
import { clearTransactions, db, listTransactions, saveTransaction } from '../lib/db'
import { downloadBlob } from '../lib/download'
import { parseExcelBackup, parseReadableTransactionsSheet, serializeExcelBackup } from '../lib/excelBackup'
import { parseExcelFile } from '../lib/excelImport'
import { getStorageMode } from '../lib/storageMode'

type SettingsPageProps = {
  onChanged: () => Promise<void>
}

export function SettingsPage({ onChanged }: SettingsPageProps) {
  const [message, setMessage] = useState('')
  const storageMode = getStorageMode()

  async function handleJsonExport() {
    const transactions = await listTransactions()
    const blob = new Blob([serializeBackup(transactions)], {
      type: 'application/json'
    })

    downloadBlob(blob, createBackupFileName('json'))
  }

  async function handleExcelExport() {
    const transactions = await listTransactions()
    const blob = new Blob([serializeExcelBackup(transactions)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    downloadBlob(blob, createBackupFileName('xlsx'))
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importResult = await parseImportFile(file)

      await db.transaction('rw', db.transactions, async () => {
        for (const transaction of importResult.transactions) {
          await saveTransaction(transaction)
        }
      })

      await onChanged()
      setMessage(importResult.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '导入失败。')
    } finally {
      event.target.value = ''
    }
  }

  async function handleClearAll() {
    const confirmed = await Dialog.confirm({
      content: '确定清空全部账单吗？此操作不可恢复。',
      confirmText: '清空',
      cancelText: '取消'
    })

    if (!confirmed) return

    await clearTransactions()
    await onChanged()
    setMessage('已清空全部数据。')
  }

  return (
    <section className="page">
      <h1>设置</h1>
      <div className="card form">
        <div>
          <strong>{storageMode.label}</strong>
          <p className="muted">{storageMode.description}</p>
        </div>

        <hr />

        <button className="primary" type="button" onClick={handleJsonExport}>
          导出 JSON
        </button>
        <button className="primary" type="button" onClick={handleExcelExport}>
          导出 Excel
        </button>
        <label className="field">
          <span>导入备份</span>
          <input type="file" accept=".json,.xls,.xlsx,application/json" onChange={handleImport} />
        </label>

        <button className="danger-action" type="button" onClick={handleClearAll}>
          清空全部数据
        </button>

        {message && <p className="message">{message}</p>}
      </div>
    </section>
  )
}

type ImportResult = {
  transactions: Awaited<ReturnType<typeof parseBackup>>
  message: string
}

async function parseImportFile(file: File): Promise<ImportResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    return {
      transactions: parseBackup(await file.text()),
      message: '导入完成。'
    }
  }

  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    const buffer = await file.arrayBuffer()
    const backupResult = parseExcelBackup(buffer)
    if (backupResult) {
      return {
        transactions: backupResult.transactions,
        message: `导入完成：成功 ${backupResult.transactions.length} 条，跳过 ${backupResult.skipped} 条。`
      }
    }

    const readableResult = parseReadableTransactionsSheet(buffer)
    if (readableResult) {
      return {
        transactions: readableResult.transactions,
        message: `导入完成：成功 ${readableResult.transactions.length} 条，跳过 ${readableResult.skipped} 条。`
      }
    }

    const result = parseExcelFile(buffer)
    return {
      transactions: result.transactions,
      message: `导入完成：成功 ${result.transactions.length} 条，跳过 ${result.skipped} 条。`
    }
  }

  throw new Error('不支持的导入文件格式')
}
