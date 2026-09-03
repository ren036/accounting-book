import { useRef, useState } from 'react'
import { AutoCenter, Button, Dialog } from 'antd-mobile'
import { parseBackup, serializeBackup } from '../lib/backup'
import { createBackupFileName } from '../lib/backupFileName'
import {
  clearAllData,
  getPreference,
  listSavingsBuckets,
  listSavingsMovements,
  listTransactions,
  saveSavingsBuckets,
  saveSavingsMovements,
  saveTransactions,
  setPreference
} from '../lib/db'
import { downloadBlob } from '../lib/download'
import { getStorageMode } from '../lib/storageMode'
import { cardClass, fieldClass, pageClass } from '../ui/classes'

const versionUpdatedAt = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(new Date(__APP_BUILD_TIME__))

type SettingsPageProps = {
  onChanged: () => Promise<void>
}

export function SettingsPage({ onChanged }: SettingsPageProps) {
  const [message, setMessage] = useState('')
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const storageMode = getStorageMode()
  const importInputRef = useRef<HTMLInputElement | null>(null)

  async function handleJsonExport() {
    const [transactions, savingsBuckets, savingsMovements, openingBalanceText] = await Promise.all([
      listTransactions(), listSavingsBuckets(), listSavingsMovements(), getPreference('opening-disposable-balance')
    ])
    const blob = new Blob([serializeBackup({
      transactions,
      savingsBuckets,
      savingsMovements,
      openingDisposableBalance: Number(openingBalanceText ?? 0)
    })], {
      type: 'application/json'
    })

    downloadBlob(blob, createBackupFileName('json'))
  }

  async function handleExcelExport() {
    const { serializeExcelBackup } = await import('../lib/excelBackup')
    const [transactions, savingsBuckets, savingsMovements, openingBalanceText] = await Promise.all([
      listTransactions(), listSavingsBuckets(), listSavingsMovements(), getPreference('opening-disposable-balance')
    ])
    const blob = new Blob([serializeExcelBackup(transactions, savingsBuckets, savingsMovements, Number(openingBalanceText ?? 0))], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    downloadBlob(blob, createBackupFileName('xlsx'))
  }

  function handleImportFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setSelectedImportFile(file)
    setMessage(file ? `已选择文件：${file.name}` : '')
  }

  async function handleImport() {
    if (!selectedImportFile) {
      setMessage('请先选择要导入的备份文件。')
      return
    }

    try {
      setIsImporting(true)
      const importResult = await parseImportFile(selectedImportFile)

      await saveTransactions(importResult.data.transactions)
      if (importResult.kind === 'full-backup') {
        await Promise.all([
          saveSavingsBuckets(importResult.data.savingsBuckets),
          saveSavingsMovements(importResult.data.savingsMovements),
          setPreference('opening-disposable-balance', String(importResult.data.openingDisposableBalance))
        ])
      }

      await onChanged()
      setMessage(importResult.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '导入失败。')
    } finally {
      setIsImporting(false)
      setSelectedImportFile(null)
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
    }
  }

  async function handleClearAll() {
    const confirmed = await Dialog.confirm({
      content: '确定清空全部账单、预算和储蓄数据吗？此操作不可恢复。',
      confirmText: '清空',
      cancelText: '取消'
    })

    if (!confirmed) return

    await clearAllData()
    await onChanged()
    setMessage('已清空全部数据。')
  }

  return (
    <section className={`${pageClass} p-3`}>
      <AutoCenter className="mb-2 text-xl">设置</AutoCenter>
      <div className={`${cardClass} grid gap-4`}>
        <div>
          <strong>{storageMode.label}</strong>
          <p className="text-[var(--book-muted)]">{storageMode.description}</p>
        </div>

        <hr className="w-full border-0 border-t border-[var(--book-border)]" />

        <Button color="primary" type="button" shape="rounded" onClick={handleJsonExport}>
          导出 JSON
        </Button>
        <Button color='primary' fill='solid' className="!bg-[#5b8def] !border-[#5b8def]" type="button" shape="rounded" onClick={handleExcelExport}>
          导出 Excel
        </Button>
        <label className={fieldClass}>
          <span>导入备份</span>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.xls,.xlsx,application/json"
            onChange={handleImportFileChange}
          />
        </label>
        <Button color="primary" type="button" shape="rounded" onClick={handleImport} disabled={!selectedImportFile || isImporting}>
          {isImporting ? '导入中...' : '导入'}
        </Button>

        <Button className="!border-[#f4cdd2] !bg-[#fff1f2] !text-[#c74f5b]" type="button" shape="rounded" onClick={handleClearAll}>
          清空全部数据
        </Button>

        {message && <p className="m-0 text-[#4f6fae]">{message}</p>}

        <p className="m-0 text-center text-xs text-[var(--book-muted)]">
          版本 v{__APP_VERSION__} · 更新于 {versionUpdatedAt}
        </p>
      </div>
    </section>
  )
}

type ImportResult = {
  data: Awaited<ReturnType<typeof parseBackup>>
  kind: 'full-backup' | 'transactions'
  message: string
}

async function parseImportFile(file: File): Promise<ImportResult> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    return {
      data: parseBackup(await file.text()),
      kind: 'full-backup',
      message: '导入完成。'
    }
  }

  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    const buffer = await file.arrayBuffer()
    const [{ parseExcelBackup, parseReadableTransactionsSheet }, { parseExcelFile }] = await Promise.all([
      import('../lib/excelBackup'),
      import('../lib/excelImport')
    ])
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
        data: { transactions: readableResult.transactions, savingsBuckets: [], savingsMovements: [], openingDisposableBalance: 0 },
        kind: 'transactions',
        message: `导入完成：成功 ${readableResult.transactions.length} 条，跳过 ${readableResult.skipped} 条。`
      }
    }

    const result = parseExcelFile(buffer)
    return {
      data: { transactions: result.transactions, savingsBuckets: [], savingsMovements: [], openingDisposableBalance: 0 },
      kind: 'transactions',
      message: `导入完成：成功 ${result.transactions.length} 条，跳过 ${result.skipped} 条。`
    }
  }

  throw new Error('不支持的导入文件格式')
}
