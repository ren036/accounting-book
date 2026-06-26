# Mobile Layout Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep summary/header areas fixed while lists scroll, prevent mobile input zoom, and constrain transaction dates to today or earlier.

**Architecture:** Preserve the existing custom UI and make minimal JSX/CSS changes. Use CSS page shells for non-scrolling headers and scrolling list regions; keep the native date input and add `max` for future-date prevention.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, CSS.

---

### Task 1: Date Input Constraint

**Files:**
- Modify: `src/components/TransactionForm.tsx`
- Create: `src/tests/transactionForm.test.tsx`

- [ ] Add a test that renders `TransactionForm` and asserts the date input has `max` equal to `todayInputValue()`.
- [ ] Run `npm test -- src/tests/transactionForm.test.tsx` and confirm the test fails before implementation.
- [ ] Add `max={todayInputValue()}` to the date input.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Fixed Headers And Scrollable Lists

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/pages/StatsPage.tsx`
- Modify: `src/pages/MonthTransactionsPage.tsx`
- Modify: `src/styles.css`

- [ ] Wrap each page's non-scrolling top content in a header container.
- [ ] Wrap each long list section in a scroll container.
- [ ] Add CSS grid/flex rules so only the list area scrolls inside the viewport above the bottom nav.
- [ ] Keep desktop max-width and existing card visual style unchanged.

### Task 3: Mobile Input Stability

**Files:**
- Modify: `src/styles.css`

- [ ] Set form controls to at least `16px` on mobile to prevent iOS Safari auto-zoom.
- [ ] Ensure date/select/textarea widths use `min-width: 0` and `max-width: 100%` to avoid overflow.

### Task 4: Verification

**Files:**
- No production edits.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Report any remaining manual mobile-browser verification needed.
