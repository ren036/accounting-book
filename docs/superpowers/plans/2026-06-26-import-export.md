# Import Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add explicit JSON and Excel export choices, and import JSON, exported Excel, readable Excel, and special historical Excel formats.

**Architecture:** Keep JSON schema authority in `src/lib/backup.ts`. Expand `src/lib/excelBackup.ts` so Excel export/import uses a direct `Transactions` worksheet with `id/type/amount/category/note/occurredAt` columns while preserving the existing readable-sheet parser. Update `SettingsPage.tsx` to expose two export buttons and reuse the existing import pipeline with the new parser first.

**Tech Stack:** React 19, TypeScript, Vitest, Dexie, `xlsx`.

---

## File Structure

- Modify `src/lib/excelBackup.ts`: serialize exported Excel rows, parse exported Excel rows, keep readable parser compatibility.
- Modify `src/tests/excelBackup.test.ts`: cover direct transaction worksheet export/import and readable parser fallback.
- Modify `src/pages/SettingsPage.tsx`: add JSON export button, rename Excel export button, call the new Excel serializer/parser.
- Modify or add UI tests only if an existing Settings page test file exists; no new UI framework is currently present, so behavior is verified through library tests and build.

### Task 1: Excel Direct Transactions Worksheet

**Files:**
- Modify: `src/tests/excelBackup.test.ts`
- Modify: `src/lib/excelBackup.ts`

- [ ] **Step 1: Write failing tests for direct `Transactions` worksheet export/import**

Replace `src/tests/excelBackup.test.ts` with:

```ts
import { describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import type { Transaction } from '../domain/transaction'
import { parseExcelBackup, parseReadableTransactionsSheet, serializeExcelBackup } from '../lib/excelBackup'

const transactions: Transaction[] = [
  {
    id: 't1',
    type: 'expense',
    amount: 12.5,
    category: '餐饮',
    note: '午饭',
    occurredAt: '2026-06-01T00:00:00.000Z'
  },
  {
    id: 't2',
    type: 'income',
    amount: 3000,
    category: '工资',
    note: '六月工资',
    occurredAt: '2026-06-02T00:00:00.000Z'
  }
]

describe('excelBackup', () => {
  it('serializes transactions as visible worksheet rows', () => {
    const buffer = serializeExcelBackup(transactions)
    const workbook = XLSX.read(buffer, { type: 'array' })
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets.Transactions, { header: 1, raw: true })

    expect(rows).toEqual([
      ['id', 'type', 'amount', 'category', 'note', 'occurredAt'],
      ['t1', 'expense', 12.5, '餐饮', '午饭', '2026-06-01T00:00:00.000Z'],
      ['t2', 'income', 3000, '工资', '六月工资', '2026-06-02T00:00:00.000Z']
    ])
  })

  it('parses exported transaction worksheet rows and preserves ids', () => {
    const buffer = serializeExcelBackup(transactions)

    expect(parseExcelBackup(buffer)).toEqual({ skipped: 0, transactions })
  })

  it('skips invalid exported transaction worksheet rows', () => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['id', 'type', 'amount', 'category', 'note', 'occurredAt'],
      ['valid-id', 'expense', 12.5, '餐饮', '午饭', '2026-06-01T00:00:00.000Z'],
      ['missing-id', 'expense', 12.5, '餐饮', '午饭', 'not-a-date'],
      ['', 'income', 3000, '工资', '六月工资', '2026-06-02T00:00:00.000Z']
    ])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseExcelBackup(buffer)).toEqual({
      skipped: 2,
      transactions: [
        {
          id: 'valid-id',
          type: 'expense',
          amount: 12.5,
          category: '餐饮',
          note: '午饭',
          occurredAt: '2026-06-01T00:00:00.000Z'
        }
      ]
    })
  })

  it('imports readable Transactions sheet rows', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000101')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000102')

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['日期', '类型', '金额', '分类', '备注'],
      ['2026-06-01', '支出', 12.5, '餐饮', '午饭'],
      ['2026-06-02', '收入', '3000', '工资', '六月工资'],
      ['not-a-date', '支出', 10, '其他', '无效日期']
    ])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseReadableTransactionsSheet(buffer)).toEqual({
      skipped: 1,
      transactions: [
        {
          id: '00000000-0000-4000-8000-000000000101',
          type: 'expense',
          amount: 12.5,
          category: '餐饮',
          note: '午饭',
          occurredAt: '2026-06-01T00:00:00.000Z'
        },
        {
          id: '00000000-0000-4000-8000-000000000102',
          type: 'income',
          amount: 3000,
          category: '工资',
          note: '六月工资',
          occurredAt: '2026-06-02T00:00:00.000Z'
        }
      ]
    })
  })

  it('returns null when no exported Transactions sheet exists', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['version', 1]]), 'Backup')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseExcelBackup(buffer)).toBeNull()
  })

  it('returns null when no readable Transactions sheet exists', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['version', 1]]), 'Backup')
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

    expect(parseReadableTransactionsSheet(buffer)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify the current implementation fails**

Run: `npm test -- src/tests/excelBackup.test.ts`

Expected: FAIL because `parseExcelBackup` currently returns `Transaction[] | null`, and Excel export includes a `Backup` sheet plus a readable Chinese-header `Transactions` sheet instead of direct object-field rows.

- [ ] **Step 3: Implement direct worksheet export/import**

Replace `src/lib/excelBackup.ts` with:

```ts
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
```

- [ ] **Step 4: Run tests to verify direct worksheet behavior passes**

Run: `npm test -- src/tests/excelBackup.test.ts`

Expected: PASS.

### Task 2: Settings Export And Import Pipeline

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Test indirectly through `npm test` and `npm run build`

- [ ] **Step 1: Update Settings page imports and export handlers**

In `src/pages/SettingsPage.tsx`, change imports to include `serializeBackup` and update the Excel parser result type handling:

```ts
import { parseBackup, serializeBackup } from '../lib/backup'
```

Replace `handleExport` with two handlers:

```ts
  async function handleJsonExport() {
    const transactions = await listTransactions()
    const blob = new Blob([serializeBackup(transactions)], {
      type: 'application/json'
    })
    downloadBlob(blob, `accounting-book-${new Date().toISOString().slice(0, 10)}.json`)
  }

  async function handleExcelExport() {
    const transactions = await listTransactions()
    const blob = new Blob([serializeExcelBackup(transactions)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    downloadBlob(blob, `accounting-book-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }
```

Add this import if `downloadBlob` is not already imported:

```ts
import { downloadBlob } from '../lib/download'
```

Replace the single export button with:

```tsx
        <button className="primary" type="button" onClick={handleJsonExport}>
          导出 JSON
        </button>
        <button className="primary" type="button" onClick={handleExcelExport}>
          导出 Excel
        </button>
```

- [ ] **Step 2: Update Excel import handling for parser results**

In `parseImportFile`, replace the Excel branch with:

```ts
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
```

- [ ] **Step 3: Run TypeScript build**

Run: `npm run build`

Expected: PASS. If it fails because of unused imports or the changed `parseExcelBackup` return type, fix the exact TypeScript error without changing the design.

### Task 3: Full Verification

**Files:**
- No planned source changes unless tests reveal a defect.

- [ ] **Step 1: Run focused tests**

Run: `npm test -- src/tests/excelBackup.test.ts src/tests/excelImport.test.ts src/tests/backup.test.ts`

Expected: PASS.

- [ ] **Step 2: Run all tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS.

## Self-Review

- Spec coverage: Task 1 covers Excel exported worksheet format and imported ID preservation. Task 2 covers selectable JSON/Excel export and import parser priority. Task 3 covers existing readable and historical Excel compatibility through focused and full tests.
- Placeholder scan: no placeholders remain.
- Type consistency: `parseExcelBackup` and `parseReadableTransactionsSheet` both return `ExcelImportResult | null`; `SettingsPage.tsx` consumes `.transactions` and `.skipped` from both.
