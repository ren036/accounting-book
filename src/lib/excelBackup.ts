import * as XLSX from 'xlsx'
import type { Transaction, TransactionType } from '../domain/transaction'

export type ExcelImportResult = {
  transactions: Transaction[]
  skipped: number
}

const exportedHeaders = ['id', 'type', 'amount', 'category', 'note', 'occurredAt']
const readableHeaders = ['日期', '类型', '金额', '分类', '备注']

export function serializeExcelBackup(transactions: Transaction[]): ArrayBuffer {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    exportedHeaders,
    ...transactions.map((transaction) => [
      transaction.id,
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.note,
      transaction.occurredAt
    ])
  ])

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

export function parseExcelBackup(buffer: ArrayBuffer): ExcelImportResult | null {
  const rows = readTransactionsRows(buffer)
  if (!rows || !hasHeaders(rows[0], exportedHeaders)) return null

  const transactions: Transaction[] = []
  let skipped = 0

  for (const row of rows.slice(1)) {
    const transaction = parseExportedRow(row)
    if (transaction) {
      transactions.push(transaction)
    } else if (!isEmptyRow(row)) {
      skipped += 1
    }
  }

  return { transactions, skipped }
}

export function parseReadableTransactionsSheet(buffer: ArrayBuffer): ExcelImportResult | null {
  const rows = readTransactionsRows(buffer)
  if (!rows || !hasHeaders(rows[0], readableHeaders)) return null

  const transactions: Transaction[] = []
  let skipped = 0

  for (const row of rows.slice(1)) {
    const transaction = parseReadableRow(row)
    if (transaction) {
      transactions.push(transaction)
    } else if (!isEmptyRow(row)) {
      skipped += 1
    }
  }

  return { transactions, skipped }
}

function readTransactionsRows(buffer: ArrayBuffer): unknown[][] | null {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const worksheet = workbook.Sheets.Transactions
  if (!worksheet) return null

  return XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true })
}

function parseExportedRow(row: unknown[]): Transaction | null {
  if (isEmptyRow(row)) return null

  const id = String(row[0] ?? '').trim()
  const type = parseType(row[1])
  const amount = parseAmount(row[2])
  const category = String(row[3] ?? '').trim()
  const note = String(row[4] ?? '').trim()
  const occurredAt = String(row[5] ?? '').trim()

  if (!id || !type || amount === null || !category || !isIsoDateTime(occurredAt)) return null

  return { id, type, amount, category, note, occurredAt }
}

function parseReadableRow(row: unknown[]): Transaction | null {
  if (isEmptyRow(row)) return null

  const date = parseDate(row[0])
  const type = parseReadableType(row[1])
  const amount = parseAmount(row[2])
  if (!date || !type || amount === null) return null

  return {
    id: crypto.randomUUID(),
    type,
    amount,
    category: String(row[3] ?? '').trim() || '其他',
    note: String(row[4] ?? '').trim(),
    occurredAt: `${date}T00:00:00.000Z`
  }
}

function hasHeaders(row: unknown[] | undefined, headers: string[]): boolean {
  if (!row) return false
  return headers.every((header, index) => String(row[index] ?? '').trim() === header)
}

function isEmptyRow(row: unknown[]): boolean {
  return row.length === 0 || row.every((cell) => String(cell ?? '').trim() === '')
}

function parseType(value: unknown): TransactionType | null {
  const text = String(value ?? '').trim()
  if (text === 'income') return 'income'
  if (text === 'expense') return 'expense'
  return null
}

function parseReadableType(value: unknown): TransactionType | null {
  const text = String(value ?? '').trim()
  if (text === '收入') return 'income'
  if (text === '支出') return 'expense'
  return null
}

function parseAmount(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isFinite(amount) || amount <= 0) return null
  return Math.round(amount * 100) / 100
}

function parseDate(value: unknown): string | null {
  const text = String(value ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  return null
}

function isIsoDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
}
