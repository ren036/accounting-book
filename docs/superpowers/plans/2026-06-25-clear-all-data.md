# Clear All Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a settings page button that clears all local transactions after confirmation.

**Architecture:** Add a small database helper that clears the `transactions` table. Wire the settings page to show an `antd-mobile` confirmation dialog before clearing, then refresh app state and show a success message.

**Tech Stack:** TypeScript, React, Dexie, antd-mobile, Vitest.

---

### Task 1: Add Clear Transactions API

**Files:**
- Modify: `src/lib/db.ts`

- [ ] **Step 1: Add clear helper**

Add `clearTransactions()` that calls `db.transactions.clear()`.

- [ ] **Step 2: Build type check**

Run: `npm run build`

Expected: PASS.

### Task 2: Add Settings Button

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Import Dialog and clear helper**

Import `Dialog` from `antd-mobile` and `clearTransactions` from `../lib/db`.

- [ ] **Step 2: Add clear handler**

Add `handleClearAll()` that opens `Dialog.confirm` with irreversible warning, calls `clearTransactions()`, calls `onChanged()`, and sets message `已清空全部数据。`.

- [ ] **Step 3: Add danger button**

Add a `.danger-action` button labeled `清空全部数据` below import/export controls.

- [ ] **Step 4: Build type check**

Run: `npm run build`

Expected: PASS.

### Task 3: Full Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS.

### Self-Review

- Spec coverage: Plan covers clear API, confirmation UI, state refresh, success message, and verification.
- Placeholder scan: No placeholders remain.
- Type consistency: Uses existing `db.transactions` and existing settings page `onChanged` flow.
