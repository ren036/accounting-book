# Simplify Transaction Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove unused transaction fields and make deletes permanently remove local records.

**Architecture:** The `Transaction` domain type becomes the single minimal record shape. Backup parsing normalizes old and new backup records into that shape, while database deletion switches from soft-delete updates to direct IndexedDB deletes.

**Tech Stack:** TypeScript, React, Dexie, Vitest.

---

### Task 1: Backup Parser Normalizes To Minimal Model

**Files:**
- Modify: `src/tests/backup.test.ts`
- Modify: `src/lib/backup.ts`

- [ ] **Step 1: Write failing tests**

Replace backup tests so they expect only minimal transaction fields and expect old soft-deleted records to be skipped.

```ts
import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from '../lib/backup'
import type { Transaction } from '../domain/transaction'

describe('backup', () => {
  it('serializes and parses minimal transactions', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        type: 'expense',
        amount: 12,
        category: '餐饮',
        note: '午饭',
        occurredAt: '2026-06-01T00:00:00.000Z'
      }
    ]

    expect(parseBackup(serializeBackup(transactions))).toEqual(transactions)
  })

  it('rejects invalid backup content', () => {
    expect(() => parseBackup('{"version":2,"transactions":[]}')).toThrow('备份文件格式不正确')
  })

  it('strips removed fields from imported old transactions', () => {
    const transactions = parseBackup(JSON.stringify({
      version: 1,
      exportedAt: '2026-06-25T00:00:00.000Z',
      transactions: [
        {
          id: 'historical-2024',
          type: 'expense',
          amount: 88,
          category: '餐饮',
          note: '历史账单',
          occurredAt: '2024-03-02T00:00:00.000Z',
          createdAt: '2024-03-02T00:00:00.000Z',
          updatedAt: '2024-03-02T00:00:00.000Z',
          deletedAt: null,
          syncStatus: 'synced'
        }
      ]
    }))

    expect(transactions).toEqual([
      {
        id: 'historical-2024',
        type: 'expense',
        amount: 88,
        category: '餐饮',
        note: '历史账单',
        occurredAt: '2024-03-02T00:00:00.000Z'
      }
    ])
  })

  it('skips imported old soft-deleted transactions', () => {
    const transactions = parseBackup(JSON.stringify({
      version: 1,
      exportedAt: '2026-06-25T00:00:00.000Z',
      transactions: [
        {
          id: 'deleted-old-record',
          type: 'expense',
          amount: 50,
          category: '餐饮',
          note: '已删除',
          occurredAt: '2024-03-02T00:00:00.000Z',
          createdAt: '2024-03-02T00:00:00.000Z',
          updatedAt: '2024-03-02T00:00:00.000Z',
          deletedAt: '2024-03-03T00:00:00.000Z',
          syncStatus: 'synced'
        }
      ]
    }))

    expect(transactions).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/tests/backup.test.ts`

Expected: FAIL because `Transaction` still requires removed fields and `parseBackup` still returns old fields.

- [ ] **Step 3: Implement minimal backup normalization**

Update `src/lib/backup.ts` so `parseBackup` maps old or new records to the minimal shape and filters old soft-deleted records.

- [ ] **Step 4: Run backup tests**

Run: `npm test -- src/tests/backup.test.ts`

Expected: PASS.

### Task 2: Domain Model Removes Unused Fields

**Files:**
- Modify: `src/domain/transaction.ts`
- Modify: `src/tests/transaction.test.ts`
- Modify: `src/components/TransactionForm.tsx`

- [ ] **Step 1: Write failing transaction test**

Update transaction tests to assert `updateTransaction` only returns minimal fields and does not write removed fields.

- [ ] **Step 2: Run transaction tests to verify failure**

Run: `npm test -- src/tests/transaction.test.ts`

Expected: FAIL because `updateTransaction` still writes `updatedAt`, `deletedAt`, and `syncStatus`.

- [ ] **Step 3: Implement minimal transaction model**

Remove `SyncStatus`, `createdAt`, `updatedAt`, `deletedAt`, and `syncStatus` from `Transaction`; update `updateTransaction`; stop creating removed fields in `TransactionForm`.

- [ ] **Step 4: Run transaction tests**

Run: `npm test -- src/tests/transaction.test.ts`

Expected: PASS.

### Task 3: Permanent Delete And Summary Cleanup

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/App.tsx`
- Modify: `src/domain/summary.ts`
- Modify: `src/tests/summary.test.ts`

- [ ] **Step 1: Update tests for no soft-delete filtering**

Remove deleted-record expectations from summary tests because deleted records will no longer be present in input data.

- [ ] **Step 2: Run summary tests to verify failure**

Run: `npm test -- src/tests/summary.test.ts`

Expected: FAIL while production code still references removed `deletedAt` and `updatedAt` fields after Task 2.

- [ ] **Step 3: Implement permanent delete and remove deletedAt filters**

Rename `softDeleteTransaction` usage to `deleteTransaction`, call `db.transactions.delete(id)`, remove `deletedAt` filters, and sort same-day transactions without `updatedAt`.

- [ ] **Step 4: Run summary tests**

Run: `npm test -- src/tests/summary.test.ts`

Expected: PASS.

### Task 4: Database Schema Cleanup

**Files:**
- Modify: `src/lib/db.ts`

- [ ] **Step 1: Update Dexie schema**

Add a version 2 schema using `id, type, category, occurredAt` and remove sync-related helpers.

- [ ] **Step 2: Run TypeScript build**

Run: `npm run build`

Expected: PASS with no references to removed fields.

### Task 5: Full Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS.

### Self-Review

- Spec coverage: Tasks cover minimal model, backup compatibility, permanent delete, summary cleanup, and schema cleanup.
- Placeholder scan: No placeholder requirements remain.
- Type consistency: Uses the minimal `Transaction` shape from the design spec throughout.
