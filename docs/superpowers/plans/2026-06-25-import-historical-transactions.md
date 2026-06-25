# Import Historical Transactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow imported backup records from any year to appear in the app's year/month statistics while preserving their original dates.

**Architecture:** Keep display rules unchanged: dashboard shows current-month records, statistics exposes available years and months. Normalize backup records during parsing so active imported records have `deletedAt: null` even when older backups omitted that field.

**Tech Stack:** React, TypeScript, Dexie, Vitest.

---

### Task 1: Normalize Imported Backup Records

**Files:**
- Modify: `src/tests/backup.test.ts`
- Modify: `src/lib/backup.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('backup', () => { ... })` block in `src/tests/backup.test.ts`:

```ts
  it('normalizes imported active transactions without deletedAt', () => {
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
          syncStatus: 'synced'
        }
      ]
    }))

    expect(transactions[0]).toMatchObject({
      id: 'historical-2024',
      occurredAt: '2024-03-02T00:00:00.000Z',
      deletedAt: null
    })
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/backup.test.ts`

Expected: FAIL because `deletedAt` is `undefined`, not `null`.

- [ ] **Step 3: Write minimal implementation**

Modify `parseBackup` in `src/lib/backup.ts` to return normalized records:

```ts
export function parseBackup(content: string): Transaction[] {
  const parsed = JSON.parse(content) as BackupFile

  if (parsed.version !== 1 || !Array.isArray(parsed.transactions)) {
    throw new Error('备份文件格式不正确')
  }

  return parsed.transactions.map((transaction) => ({
    ...transaction,
    deletedAt: transaction.deletedAt ?? null
  }))
}
```

- [ ] **Step 4: Run targeted test to verify it passes**

Run: `npm test -- src/tests/backup.test.ts`

Expected: PASS.

- [ ] **Step 5: Run all tests**

Run: `npm test`

Expected: PASS for all test files.

### Self-Review

- Spec coverage: Task 1 preserves historical `occurredAt` values and prevents active imported records from being hidden by `deletedAt === null` filters.
- Placeholder scan: No placeholders remain.
- Type consistency: Uses existing `Transaction` fields and existing `parseBackup(content: string): Transaction[]` signature.
