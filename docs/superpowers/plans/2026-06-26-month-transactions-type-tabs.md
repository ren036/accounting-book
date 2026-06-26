# Month Transactions Type Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tabs to monthly bill details so users can switch between expense and income transactions.

**Architecture:** Keep the tab state local to `MonthTransactionsPage`. Add a domain helper to filter monthly transactions by `TransactionType`, then group the filtered list with the existing day grouping logic.

**Tech Stack:** React 19, TypeScript, Vitest static/domain tests, existing CSS.

---

### Task 1: Filter Month Transactions By Type

**Files:**
- Modify: `src/domain/summary.ts`
- Modify: `src/tests/summary.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(filterMonthTransactionsByType(transactions, '2026-06', 'expense').map((transaction) => transaction.id)).toEqual(['expense-1'])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/summary.test.ts`

Expected: FAIL because `filterMonthTransactionsByType` is not exported.

- [ ] **Step 3: Implement helper and use it in grouping**

```ts
export function filterMonthTransactionsByType(transactions: Transaction[], month: string, type: TransactionType): Transaction[] {
  return transactions.filter((transaction) => transaction.type === type).filter((transaction) => transaction.occurredAt.startsWith(month))
}
```

- [ ] **Step 4: Add UI tabs in `MonthTransactionsPage`**

Add local `activeType` state defaulting to `'expense'`, render two tab buttons, filter transactions before grouping, and show type-specific empty text.

- [ ] **Step 5: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.
