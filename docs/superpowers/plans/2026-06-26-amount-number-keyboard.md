# Amount Number Keyboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `antd-mobile NumberKeyboard` based amount input that supports simple addition expressions such as `10+2`.

**Architecture:** Keep amount expression parsing in `src/lib/money.ts`. Update `AmountInput` to display a read-only amount field and open `NumberKeyboard`, then keep `TransactionForm` responsible for validating and saving the evaluated number.

**Tech Stack:** React 19, TypeScript, antd-mobile `NumberKeyboard`, Vitest.

---

### Task 1: Amount Expression Evaluation

**Files:**
- Modify: `src/lib/money.ts`
- Create: `src/tests/money.test.ts`
- Modify: `src/components/AmountInput.tsx`
- Modify: `src/components/TransactionForm.tsx`

- [ ] **Step 1: Write failing money tests**

```ts
expect(evaluateAmountExpression('10+2')).toBe(12)
expect(evaluateAmountExpression('10.5+2+0.25')).toBe(12.75)
expect(evaluateAmountExpression('10+')).toBeNull()
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/tests/money.test.ts`

Expected: FAIL because `evaluateAmountExpression` does not exist.

- [ ] **Step 3: Implement evaluator**

Parse only positive decimal numbers joined by `+`. Return `null` for malformed expressions.

- [ ] **Step 4: Wire `NumberKeyboard` into `AmountInput`**

Make the visible input read-only, open the keyboard on focus/click, support digits, `.`, `+`, delete, and done.

- [ ] **Step 5: Use evaluator in `TransactionForm` submit validation**

Replace `Number(amount)` with `evaluateAmountExpression(amount)`.

- [ ] **Step 6: Verify**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.
