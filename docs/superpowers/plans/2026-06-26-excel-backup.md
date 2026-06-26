# Excel Backup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export backups as Excel files and import app Excel backups, readable Excel transaction sheets, JSON backups, and existing historical Excel files.

**Architecture:** Add a focused `src/lib/excelBackup.ts` module for app Excel backup serialization and readable sheet parsing. Keep `src/lib/backup.ts` as the JSON backup schema authority and keep `src/lib/excelImport.ts` as the historical fixed-column parser. Update `SettingsPage.tsx` to export `.xlsx` and to try Excel import parsers in the required priority order.

**Tech Stack:** React 19, TypeScript, Vitest, Dexie, `xlsx`.

---

## File Structure

- Create `src/lib/excelBackup.ts`: converts transactions to/from app Excel backup workbooks and parses readable `Transactions` sheets.
- Create `src/tests/excelBackup.test.ts`: tests Excel backup round-trip and readable sheet import.
- Modify `src/pages/SettingsPage.tsx`: downloads `.xlsx` backups and tries app Excel backup/readable/historical parsers for `.xls/.xlsx` imports.
- Keep `src/lib/backup.ts`: JSON backup parser/serializer remains unchanged and is reused by the Excel backup module.
- Keep `src/lib/excelImport.ts`: historical fixed-column parser remains unchanged and is used as the final fallback.

### Task 1: Excel Backup Module Tests

**Files:**
- Create: `src/tests/excelBackup.test.ts`
- Create later: `src/lib/excelBackup.ts`

- [ ] **Step 1: Write failing tests for app Excel backup round-trip and readable sheet import**

Create `src/tests/excelBackup.test.ts` with:

```ts
import { describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import type { Transaction } from '../domain/transaction'
import { parseExcelBackup, parseReadableTransactionsSheet, serializeExcelBackup } from '../lib/excelBackup'

describe('excelBackup', () => {
  it('serializes and parses an app Excel backup workbook', () => {
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

    const buffer = serializeExcelBackup(transactions)

    expect(parseExcelBackup(buffer)).toEqual(transactions)
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

  it('returns null when no valid Backup sheet exists', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['日期']]), 'Transactions')
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

- [ ] **Step 2: Run the new tests and verify they fail because the module does not exist**

Run: `npm test -- src/tests/excelBackup.test.ts`

Expected: FAIL with an import resolution error for `../lib/excelBackup`.

### Task 2: Excel Backup Module Implementation

**Files:**
- Create: `src/lib/excelBackup.ts`
- Test: `src/tests/excelBackup.test.ts`

- [ ] **Step 1: Implement app Excel backup serialization and parsing**

Create `src/lib/excelBackup.ts` with:

```ts
import * as XLSX from 'xlsx'
import type { Transaction, TransactionType } from '../domain/transaction'
import { parseBackup, serializeBackup } from './backup'

export type ReadableExcelImportResult = {
  transactions: Transaction[]
  skipped: number
}

export function serializeExcelBackup(transactions: Transaction[]): ArrayBuffer {
  const backup = JSON.parse(serializeBackup(transactions)) as {
    version: number
    exportedAt: string
    transactions: Transaction[]
  }

  const workbook = XLSX.utils.book_new()
  const backupSheet = XLSX.utils.aoa_to_sheet([
    ['key', 'value'],
    ['version', backup.version],
    ['exportedAt', backup.exportedAt],
    ['transactions', JSON.stringify(backup.transactions)]
  ])
  const readableSheet = XLSX.utils.aoa_to_sheet([
    ['日期', '类型', '金额', '分类', '备注'],
    ...transactions.map((transaction) => [
      transaction.occurredAt.slice(0, 10),
      transaction.type === 'income' ? '收入' : '支出',
      transaction.amount,
      transaction.category,
      transaction.note
    ])
  ])

  XLSX.utils.book_append_sheet(workbook, backupSheet, 'Backup')
  XLSX.utils.book_append_sheet(workbook, readableSheet, 'Transactions')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

export function parseExcelBackup(buffer: ArrayBuffer): Transaction[] | null {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const worksheet = workbook.Sheets.Backup
  if (!worksheet) return null

  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true })
  const values = new Map<string, unknown>()

  for (const row of rows.slice(1)) {
    const key = String(row[0] ?? '').trim()
    if (key) values.set(key, row[1])
  }

  if (!values.has('version') || !values.has('transactions')) return null

  return parseBackup(JSON.stringify({
    version: Number(values.get('version')),
    exportedAt: String(values.get('exportedAt') ?? ''),
    transactions: JSON.parse(String(values.get('transactions') ?? '[]'))
  }))
}

export function parseReadableTransactionsSheet(buffer: ArrayBuffer): ReadableExcelImportResult | null {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const worksheet = workbook.Sheets.Transactions
  if (!worksheet) return null

  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true })
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

function parseReadableRow(row: unknown[]): Transaction | null {
  if (isEmptyRow(row)) return null

  const date = parseDate(row[0])
  const type = parseType(row[1])
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

function isEmptyRow(row: unknown[]): boolean {
  return row.length === 0 || row.every((cell) => String(cell ?? '').trim() === '')
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
```

- [ ] **Step 2: Run the module tests and verify they pass**

Run: `npm test -- src/tests/excelBackup.test.ts`

Expected: PASS for all `excelBackup` tests.

### Task 3: Settings Page Integration

**Files:**
- Modify: `src/pages/SettingsPage.tsx`
- Uses: `src/lib/excelBackup.ts`
- Uses: `src/lib/excelImport.ts`

- [ ] **Step 1: Update settings export and Excel import priority**

Modify `src/pages/SettingsPage.tsx` so the imports at the top are:

```ts
import { useState } from 'react'
import { Dialog } from 'antd-mobile'
import { parseBackup } from '../lib/backup'
import { clearTransactions, db, listTransactions, saveTransaction } from '../lib/db'
import { parseExcelBackup, parseReadableTransactionsSheet, serializeExcelBackup } from '../lib/excelBackup'
import { parseExcelFile } from '../lib/excelImport'
import { getStorageMode } from '../lib/storageMode'
```

Replace `handleExport` with:

```ts
  async function handleExport() {
    const transactions = await listTransactions()
    const blob = new Blob([serializeExcelBackup(transactions)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `accounting-book-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }
```

Replace `parseImportFile` with:

```ts
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
    const backupTransactions = parseExcelBackup(buffer)
    if (backupTransactions) {
      return {
        transactions: backupTransactions,
        message: '导入完成。'
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
```

- [ ] **Step 2: Run the existing test suite**

Run: `npm test`

Expected: PASS. Existing `backup` and `excelImport` tests must still pass.

### Task 4: Build Verification

**Files:**
- Verify all TypeScript and Vite build output.

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: PASS with TypeScript compilation and Vite build completed.

- [ ] **Step 2: Inspect changed files**

Run: `git diff -- src/lib/excelBackup.ts src/tests/excelBackup.test.ts src/pages/SettingsPage.tsx docs/superpowers/specs/2026-06-26-excel-backup-design.md docs/superpowers/plans/2026-06-26-excel-backup.md`

Expected: Diff contains only Excel backup/import/export changes and the approved spec/plan.

---

## Self-Review

Spec coverage:

- Excel export as `.xlsx`: Task 2 and Task 3.
- `Backup` and `Transactions` sheets: Task 2.
- Import priority app backup, readable sheet, historical parser: Task 3.
- JSON import remains supported: Task 3 keeps `parseBackup` for `.json`.
- Existing special Excel logic remains: Task 3 uses `parseExcelFile` as final fallback without modifying `src/lib/excelImport.ts`.
- Tests for round-trip, readable import, and existing parser preservation: Task 1, Task 2, Task 3.

Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain.

Type consistency: `serializeExcelBackup`, `parseExcelBackup`, and `parseReadableTransactionsSheet` are defined in Task 2 and imported with the same names in Task 3.
