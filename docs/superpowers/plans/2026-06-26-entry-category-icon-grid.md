# Entry Category Icon Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the category select on the entry form with a tappable icon-over-text category grid and update category lists.

**Architecture:** Keep category data in `src/domain/categories.ts` and emoji mapping in `src/domain/icons.ts`. Add a small reusable `CategoryPicker` component used by `TransactionForm` in place of the native select.

**Tech Stack:** React 19, TypeScript, Vitest static markup/domain tests, existing CSS.

---

### Task 1: Category Data And Icon Grid

**Files:**
- Modify: `src/domain/categories.ts`
- Modify: `src/domain/icons.ts`
- Modify: `src/tests/icons.test.ts`
- Modify: `src/components/TransactionForm.tsx`
- Create: `src/components/CategoryPicker.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing tests**

Add tests for the expanded category arrays and new emoji mappings.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/tests/icons.test.ts`

Expected: FAIL because the new categories and emoji mappings do not exist yet.

- [ ] **Step 3: Implement category arrays and emoji mappings**

Update expense and income categories exactly as requested.

- [ ] **Step 4: Implement `CategoryPicker` and wire it into `TransactionForm`**

Render buttons with icon above label, highlight the selected button, and update category on click.

- [ ] **Step 5: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.
