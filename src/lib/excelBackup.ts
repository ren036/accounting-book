import * as XLSX from 'xlsx'
import { isSavingsBucketStatus, type SavingsBucket, type SavingsMovement } from '../domain/savings'
import type { Transaction, TransactionType } from '../domain/transaction'
import { isSupportedOccurredAt } from './dates'
import { roundMoney } from './money'

type ExcelImportResult = {
  transactions: Transaction[]
  savingsBuckets: SavingsBucket[]
  savingsMovements: SavingsMovement[]
  openingDisposableBalance: number
  skipped: number
}

const exportedHeaders = ['id', 'type', 'amount', 'category', 'note', 'occurredAt']

export function serializeExcelBackup(
  transactions: Transaction[],
  savingsBuckets: SavingsBucket[] = [],
  savingsMovements: SavingsMovement[] = [],
  openingDisposableBalance = 0
): ArrayBuffer {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    [...exportedHeaders, 'includeInBudget'],
    ...transactions.map((transaction) => [
      transaction.id, transaction.type, transaction.amount, transaction.category, transaction.note,
      requireSupportedOccurredAt(transaction.occurredAt), transaction.includeInBudget
    ])
  ]), 'Transactions')

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['id', 'kind', 'name', 'targetAmount', 'targetDate', 'createdAt', 'status'],
    ...savingsBuckets.map((bucket) => [bucket.id, bucket.kind, bucket.name, bucket.targetAmount ?? '', bucket.targetDate ?? '', requireSupportedOccurredAt(bucket.createdAt), bucket.status])
  ]), 'SavingsBuckets')

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['id', 'bucketId', 'type', 'amount', 'occurredAt', 'note'],
    ...savingsMovements.map((movement) => [movement.id, movement.bucketId, movement.type, movement.amount, requireSupportedOccurredAt(movement.occurredAt), movement.note])
  ]), 'SavingsMovements')

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['key', 'value'],
    ['openingDisposableBalance', openingDisposableBalance]
  ]), 'Preferences')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

export function parseExcelBackup(buffer: ArrayBuffer): ExcelImportResult | null {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const rows = readRows(workbook, 'Transactions')
  if (!rows || !hasHeaders(rows[0], exportedHeaders)) return null

  const transactions: Transaction[] = []
  let skipped = 0
  for (const row of rows.slice(1)) {
    const transaction = parseExportedRow(row)
    if (transaction) transactions.push(transaction)
    else if (!isEmptyRow(row)) skipped += 1
  }

  const bucketRows = readRows(workbook, 'SavingsBuckets')
  const movementRows = readRows(workbook, 'SavingsMovements')
  const preferenceRows = readRows(workbook, 'Preferences')
  if (!bucketRows || !movementRows || !preferenceRows) return null
  const savingsBuckets = bucketRows.slice(1).map(parseBucketRow).filter(isPresent)
  const savingsMovements = movementRows.slice(1).map(parseMovementRow).filter(isPresent)
  const openingRow = preferenceRows.find((row) => String(row[0]) === 'openingDisposableBalance')
  const openingDisposableBalance = Number(openingRow?.[1] ?? 0)

  return {
    transactions,
    savingsBuckets,
    savingsMovements,
    openingDisposableBalance: Number.isFinite(openingDisposableBalance) ? openingDisposableBalance : 0,
    skipped
  }
}

function parseExportedRow(row: unknown[]): Transaction | null {
  if (isEmptyRow(row)) return null
  const id = String(row[0] ?? '').trim()
  const type = parseType(row[1])
  const amount = parseAmount(row[2])
  const category = String(row[3] ?? '').trim()
  const note = String(row[4] ?? '').trim()
  const occurredAt = String(row[5] ?? '').trim()
  if (!id || !type || amount === null || !category || !isSupportedOccurredAt(occurredAt)) return null
  return { id, type, amount, category, note, occurredAt, includeInBudget: row[6] !== false && String(row[6]).toLowerCase() !== 'false' }
}

function parseBucketRow(row: unknown[]): SavingsBucket | null {
  const id = String(row[0] ?? '').trim()
  const kind = String(row[1] ?? '')
  const name = String(row[2] ?? '').trim()
  const targetAmountText = String(row[3] ?? '').trim()
  const targetAmount = targetAmountText ? Number(targetAmountText) : null
  const createdAt = String(row[5] ?? '').trim()
  const status = String(row[6] ?? '')
  if (!id || !name || !isSupportedOccurredAt(createdAt) || !isSavingsBucketStatus(status) || (kind !== 'general' && kind !== 'goal')) return null
  return { id, kind, name, targetAmount: targetAmount !== null && Number.isFinite(targetAmount) ? targetAmount : null, targetDate: String(row[4] ?? '').trim() || null, createdAt, status }
}

function parseMovementRow(row: unknown[]): SavingsMovement | null {
  const id = String(row[0] ?? '').trim()
  const bucketId = String(row[1] ?? '').trim()
  const type = String(row[2] ?? '')
  const amount = parseAmount(row[3])
  const occurredAt = String(row[4] ?? '').trim()
  if (!id || !bucketId || (type !== 'deposit' && type !== 'withdrawal') || amount === null || !isSupportedOccurredAt(occurredAt)) return null
  return { id, bucketId, type, amount, occurredAt, note: String(row[5] ?? '').trim() }
}

function readRows(workbook: XLSX.WorkBook, sheetName: string): unknown[][] | null {
  const worksheet = workbook.Sheets[sheetName]
  return worksheet ? XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) : null
}

function hasHeaders(row: unknown[] | undefined, headers: string[]): boolean { return Boolean(row && headers.every((header, index) => String(row[index] ?? '').trim() === header)) }
function isEmptyRow(row: unknown[]): boolean { return row.length === 0 || row.every((cell) => String(cell ?? '').trim() === '') }
function isPresent<T>(value: T | null): value is T { return value !== null }
function parseType(value: unknown): TransactionType | null { const text = String(value ?? '').trim(); return text === 'income' || text === 'expense' ? text : null }
function parseAmount(value: unknown): number | null { const amount = typeof value === 'number' ? value : Number(String(value ?? '').trim()); return Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : null }

function requireSupportedOccurredAt(value: string): string {
  if (!isSupportedOccurredAt(value)) {
    throw new Error('导出数据包含不支持的日期时间格式，只支持 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss')
  }
  return value
}
