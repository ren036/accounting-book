import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { EntryPage } from '../pages/EntryPage'

vi.mock('antd-mobile', () => ({
  Toast: {
    show: vi.fn()
  }
}))

describe('EntryPage', () => {
  it('renders a fixed-region entry page shell', () => {
    const html = renderToStaticMarkup(
      <EntryPage onCancel={() => undefined} onSaved={async () => undefined} />
    )

    expect(html).toContain('class="page entry-page"')
    expect(html).toContain('class="page-title-row"')
    expect(html).toContain('aria-label="取消"')
    expect(html).toContain('aria-label="保存"')
    expect(html).toContain('form="entry-transaction-form"')
    expect(html).not.toContain('>返回<')
  })
})
