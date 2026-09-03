import * as XLSX from 'xlsx'
import { normalizeSavingsBucketStatus, type SavingsBucket, type SavingsMovement } from '../domain/savings'
import type { Transaction, TransactionType } from '../domain/transaction'
import { formatOccurredAtForExport } from './dates'

export type ExcelImportResult = {
  transactions: Transaction[]
  savingsBuckets: SavingsBucket[]
  savingsMovements: SavingsMovement[]
  openingDisposableBalance: number
  includesSavingsData: boolean
  skipped: number
}

const exportedHeaders = ['id', 'type', 'amount', 'category', 'note', 'occurredAt']
const readableHeaders = ['日期', '类型', '金额', '分类', '备注']

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
      formatOccurredAtForExport(transaction.occurredAt), transaction.includeInBudget
    ])
  ]), 'Transactions')

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['id', 'kind', 'name', 'targetAmount', 'targetDate', 'createdAt', 'status'],
    ...savingsBuckets.map((bucket) => [bucket.id, bucket.kind, bucket.name, bucket.targetAmount ?? '', bucket.targetDate ?? '', bucket.createdAt, bucket.status])
  ]), 'SavingsBuckets')

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['id', 'bucketId', 'type', 'amount', 'occurredAt', 'note'],
    ...savingsMovements.map((movement) => [movement.id, movement.bucketId, movement.type, movement.amount, formatOccurredAtForExport(movement.occurredAt), movement.note])
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
  const includesSavingsData = Boolean(bucketRows && movementRows)
  const savingsBuckets = bucketRows?.slice(1).map(parseBucketRow).filter(isPresent) ?? []
  const savingsMovements = movementRows?.slice(1).map(parseMovementRow).filter(isPresent) ?? []
  const preferenceRows = readRows(workbook, 'Preferences') ?? []
  const openingRow = preferenceRows.find((row) => String(row[0]) === 'openingDisposableBalance')
  const openingDisposableBalance = Number(openingRow?.[1] ?? 0)

  return {
    transactions,
    savingsBuckets,
    savingsMovements,
    openingDisposableBalance: Number.isFinite(openingDisposableBalance) ? openingDisposableBalance : 0,
    includesSavingsData,
    skipped
  }
}

export function parseReadableTransactionsSheet(buffer: ArrayBuffer): ExcelImportResult | null {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const rows = readRows(workbook, 'Transactions')
  if (!rows || !hasHeaders(rows[0], readableHeaders)) return null

  const transactions: Transaction[] = []
  let skipped = 0
  for (const row of rows.slice(1)) {
    const transaction = parseReadableRow(row)
    if (transaction) transactions.push(transaction)
    else if (!isEmptyRow(row)) skipped += 1
  }
  return emptySavingsResult(transactions, skipped)
}

function parseExportedRow(row: unknown[]): Transaction | null {
  if (isEmptyRow(row)) return null
  const id = String(row[0] ?? '').trim()
  const type = parseType(row[1])
  const amount = parseAmount(row[2])
  const category = String(row[3] ?? '').trim()
  const note = String(row[4] ?? '').trim()
  const occurredAt = formatOccurredAtForExport(String(row[5] ?? '').trim())
  if (!id || !type || amount === null || !category || !isSupportedOccurredAt(occurredAt)) return null
  return { id, type, amount, category, note, occurredAt, includeInBudget: row[6] !== false && String(row[6]).toLowerCase() !== 'false' }
}

function parseReadableRow(row: unknown[]): Transaction | null {
  if (isEmptyRow(row)) return null
  const date = parseDate(row[0])
  const type = parseReadableType(row[1])
  const amount = parseAmount(row[2])
  if (!date || !type || amount === null) return null
  return { id: crypto.randomUUID(), type, amount, category: String(row[3] ?? '').trim() || '其他', note: String(row[4] ?? '').trim(), occurredAt: `${date}T00:00:00.000Z`, includeInBudget: type === 'expense' }
}

function parseBucketRow(row: unknown[]): SavingsBucket | null {
  const id = String(row[0] ?? '').trim()
  const kind = String(row[1] ?? '')
  const name = String(row[2] ?? '').trim()
  const targetAmountText = String(row[3] ?? '').trim()
  const targetAmount = targetAmountText ? Number(targetAmountText) : null
  const status = String(row[6] ?? '')
  if (!id || !name || (kind !== 'general' && kind !== 'goal') || !['active', 'used', 'cancelled', 'completed', 'consumed', 'archived'].includes(status)) return null
  return { id, kind, name, targetAmount: targetAmount !== null && Number.isFinite(targetAmount) ? targetAmount : null, targetDate: String(row[4] ?? '').trim() || null, createdAt: String(row[5] ?? ''), status: normalizeSavingsBucketStatus(status) }
}

function parseMovementRow(row: unknown[]): SavingsMovement | null {
  const id = String(row[0] ?? '').trim()
  const bucketId = String(row[1] ?? '').trim()
  const type = String(row[2] ?? '')
  const amount = parseAmount(row[3])
  const occurredAt = formatOccurredAtForExport(String(row[4] ?? '').trim())
  if (!id || !bucketId || (type !== 'deposit' && type !== 'withdrawal') || amount === null || !isSupportedOccurredAt(occurredAt)) return null
  return { id, bucketId, type, amount, occurredAt, note: String(row[5] ?? '').trim() }
}

function readRows(workbook: XLSX.WorkBook, sheetName: string): unknown[][] | null {
  const worksheet = workbook.Sheets[sheetName]
  return worksheet ? XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true }) : null
}

function emptySavingsResult(transactions: Transaction[], skipped: number): ExcelImportResult {
  return { transactions, savingsBuckets: [], savingsMovements: [], openingDisposableBalance: 0, includesSavingsData: false, skipped }
}

function hasHeaders(row: unknown[] | undefined, headers: string[]): boolean { return Boolean(row && headers.every((header, index) => String(row[index] ?? '').trim() === header)) }
function isEmptyRow(row: unknown[]): boolean { return row.length === 0 || row.every((cell) => String(cell ?? '').trim() === '') }
function isPresent<T>(value: T | null): value is T { return value !== null }
function parseType(value: unknown): TransactionType | null { const text = String(value ?? '').trim(); return text === 'income' || text === 'expense' ? text : null }
function parseReadableType(value: unknown): TransactionType | null { const text = String(value ?? '').trim(); return text === '收入' ? 'income' : text === '支出' ? 'expense' : null }
function parseAmount(value: unknown): number | null { const amount = typeof value === 'number' ? value : Number(String(value ?? '').trim()); return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) / 100 : null }
function parseDate(value: unknown): string | null { const text = String(value ?? '').trim(); return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null }
function isSupportedOccurredAt(value: string): boolean { return /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) }
