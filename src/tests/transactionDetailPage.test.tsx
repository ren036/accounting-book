import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TransactionDetailPage } from '../pages/TransactionDetailPage'
import type { Transaction } from '../domain/transaction'

vi.mock('antd-mobile', () => ({
  Dialog: {
    confirm: vi.fn()
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

describe('TransactionDetailPage', () => {
  it('shows the transaction before offering an edit action', () => {
    const html = renderToStaticMarkup(
      <TransactionDetailPage
        transaction={transaction}
        onBack={() => undefined}
        onDeleted={async () => undefined}
        onEdit={() => undefined}
      />
    )

    expect(html).toContain('账单详情')
    expect(html).toContain('-12.50')
    expect(html).toContain('餐饮')
    expect(html).toContain('午餐')
    expect(html).toContain('2026-06-26')
    expect(html).toContain('class="primary transaction-detail-edit"')
    expect(html).toContain('编辑')
    expect(html).toContain('aria-label="返回"')
    expect(html).toContain('aria-label="删除账单"')
    expect(html).not.toContain('>返回<')
    expect(html).not.toContain('编辑账单')
  })
})
