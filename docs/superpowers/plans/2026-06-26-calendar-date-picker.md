# Calendar Date Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the wheel-style date picker with a month-calendar date picker for transaction forms.

**Architecture:** Keep `TransactionForm` as the only form owner. Swap `antd-mobile` `DatePicker` for `CalendarPicker`, keep the button-style trigger, and preserve `YYYY-MM-DD` state plus existing submit serialization.

**Tech Stack:** React 19, TypeScript, antd-mobile `CalendarPicker`, Vitest static markup tests.

---

### Task 1: Replace Wheel Picker With Calendar Picker

**Files:**
- Modify: `src/tests/transactionForm.test.tsx`
- Modify: `src/components/TransactionForm.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write the failing test**

```tsx
it('uses a calendar picker trigger for transaction dates', () => {
  const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

  expect(html).toContain('class="calendar-picker-trigger"')
  expect(html).not.toContain('class="date-picker-trigger"')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/transactionForm.test.tsx`

Expected: FAIL because the form still uses `.date-picker-trigger`.

- [ ] **Step 3: Write minimal implementation**

Import `CalendarPicker` from `antd-mobile/es/components/calendar-picker`, replace `DatePicker`, control popup visibility with local state, and rename the trigger class to `.calendar-picker-trigger`.

- [ ] **Step 4: Run tests and build**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.
