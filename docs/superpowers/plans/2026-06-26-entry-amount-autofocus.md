# Entry Amount Autofocus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Focus the amount input automatically when opening the new transaction page, without changing edit-page focus behavior.

**Architecture:** `TransactionForm` already knows whether it is creating or editing through `initialTransaction`. Add an optional `autoFocus` prop to `AmountInput` and pass it only when `initialTransaction` is absent.

**Tech Stack:** React 19, TypeScript, Vitest, `react-dom/server` static markup tests.

---

### Task 1: New Transaction Amount Autofocus

**Files:**
- Modify: `src/tests/transactionForm.test.tsx`
- Modify: `src/components/AmountInput.tsx`
- Modify: `src/components/TransactionForm.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('autofocuses the amount input when creating a transaction', () => {
  const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

  expect(html).toContain('autofocus=""')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/transactionForm.test.tsx`

Expected: FAIL because the rendered amount input does not include `autofocus`.

- [ ] **Step 3: Write minimal implementation**

```tsx
type AmountInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function AmountInput({ value, onChange, autoFocus = false }: AmountInputProps) {
  return (
    <label className="field">
      <span>金额</span>
      <input
        autoFocus={autoFocus}
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
```

```tsx
<AmountInput value={amount} onChange={setAmount} autoFocus={!initialTransaction} />
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- src/tests/transactionForm.test.tsx`

Expected: PASS.

Run: `npm test`

Expected: PASS.
