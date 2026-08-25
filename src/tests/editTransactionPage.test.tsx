import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { EditTransactionPage } from '../pages/EditTransactionPage'
import type { Transaction } from '../domain/transaction'

vi.mock('antd-mobile', () => ({
  Dialog: {
    confirm: vi.fn()
  },
  Toast: {
    show: vi.fn()
  }
}))

const transaction: Transaction = {
  id: 'tx-1',
  type: 'expense',
  amount: 12.5,
  category: '餐饮',
  note: '午餐',
  occurredAt: '2026-06-26T00:00:00.000Z'
}

describe('EditTransactionPage', () => {
  it('renders the fixed-region transaction form shell', () => {
    const html = renderToStaticMarkup(
      <EditTransactionPage
        transaction={transaction}
        onCancel={() => undefined}
        onSaved={async () => undefined}
      />
    )

    expect(html).toContain('class="page entry-page"')
  })

  it('places cancel and save icon buttons in the top bar', () => {
    const html = renderToStaticMarkup(
      <EditTransactionPage
        transaction={transaction}
        onCancel={() => undefined}
        onSaved={async () => undefined}
      />
    )

    expect(html).toContain('aria-label="取消"')
    expect(html).toContain('aria-label="保存"')
    expect(html).toContain('form="edit-transaction-form"')
    expect(html).not.toContain('aria-label="删除账单"')
  })
})
