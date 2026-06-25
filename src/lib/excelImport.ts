import * as XLSX from 'xlsx'
import type { Transaction, TransactionType } from '../domain/transaction'

export type ExcelImportResult = {
  transactions: Transaction[]
  skipped: number
}

export function parseExcelRows(rows: unknown[][]): ExcelImportResult {
  const transactions: Transaction[] = []
  let skipped = 0

  for (const row of rows) {
    const transaction = parseExcelRow(row)
    if (transaction) {
      transactions.push(transaction)
    } else {
      skipped += 1
    }
  }

  return { transactions, skipped }
}

export function parseExcelFile(buffer: ArrayBuffer): ExcelImportResult {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { transactions: [], skipped: 0 }

  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true })
  return parseExcelRows(rows)
}

function parseExcelRow(row: unknown[]): Transaction | null {
  if (row.length === 0 || row.every((cell) => String(cell ?? '').trim() === '')) return null

  const date = parseDate(row[0])
  const type = parseType(row[1])
  if (!date || !type) return null

  const amount = parseAmount(type === 'income' ? row[2] : row[3])
  if (amount === null) return null

  return {
    id: crypto.randomUUID(),
    type,
    amount,
    category: String(row[6] ?? '').trim() || '其他',
    note: String(row[4] ?? '').trim(),
    occurredAt: `${date}T00:00:00.000Z`
  }
}

function parseType(value: unknown): TransactionType | null {
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
