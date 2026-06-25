# Excel Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import transaction rows from `.xls` and `.xlsx` files in addition to existing JSON backups.

**Architecture:** Add a focused Excel import parser in `src/lib/excelImport.ts` that converts worksheet rows to the minimal `Transaction` model. Update settings import to branch by file extension and use JSON backup parsing or Excel parsing as appropriate.

**Tech Stack:** TypeScript, React, Dexie, Vitest, `xlsx`.

---

### Task 1: Add Excel Row Parser

**Files:**
- Create: `src/lib/excelImport.ts`
- Create: `src/tests/excelImport.test.ts`

- [ ] **Step 1: Write failing parser tests**

Create `src/tests/excelImport.test.ts` with tests for row conversion, invalid row skipping, and summary counts.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/tests/excelImport.test.ts`

Expected: FAIL because `src/lib/excelImport.ts` does not exist.

- [ ] **Step 3: Implement row parser without workbook dependency**

Create `src/lib/excelImport.ts` with a `parseExcelRows(rows: unknown[][]): ExcelImportResult` function. It maps columns by position, generates ids, and returns `{ transactions, skipped }`.

- [ ] **Step 4: Run parser tests**

Run: `npm test -- src/tests/excelImport.test.ts`

Expected: PASS.

### Task 2: Add Workbook Parsing Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/lib/excelImport.ts`

- [ ] **Step 1: Install dependency**

Run: `npm install xlsx`

Expected: `xlsx` appears in dependencies and lockfile.

- [ ] **Step 2: Add workbook parser API**

Update `src/lib/excelImport.ts` with `parseExcelFile(buffer: ArrayBuffer): ExcelImportResult`, using `xlsx` to read the first worksheet as rows and call `parseExcelRows`.

- [ ] **Step 3: Run parser tests**

Run: `npm test -- src/tests/excelImport.test.ts`

Expected: PASS.

### Task 3: Wire Settings Import Flow

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Update import input and handler**

Accept `.json,.xls,.xlsx`; if file extension is JSON, use existing `parseBackup`; otherwise read `arrayBuffer()` and call `parseExcelFile`.

- [ ] **Step 2: Show import counts**

Set message to `导入完成：成功 N 条，跳过 M 条。` for Excel files, and keep `导入完成。` for JSON files.

- [ ] **Step 3: Build type check**

Run: `npm run build`

Expected: PASS.

### Task 4: Full Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS.

### Self-Review

- Spec coverage: Plan covers Excel format support, column mapping, skipped rows, settings UI, dependency, and verification.
- Placeholder scan: No placeholders remain.
- Type consistency: Parser returns minimal `Transaction` records and a skipped count used by settings import.
