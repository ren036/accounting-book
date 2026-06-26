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
  it('places a compact delete icon button beside the save button', () => {
    const html = renderToStaticMarkup(
      <EditTransactionPage
        transaction={transaction}
        onCancel={() => undefined}
        onDeleted={async () => undefined}
        onSaved={async () => undefined}
      />
    )

    expect(html).toContain('class="transaction-form-footer has-action"')
    expect(html).toContain('class="icon-danger-action"')
    expect(html).toContain('aria-label="删除账单"')
    expect(html).toContain('保存修改')
    expect(html).not.toContain('>删除账单<')
  })
})
