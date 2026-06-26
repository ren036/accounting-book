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
    const html = renderToStaticMarkup(<EntryPage onSaved={async () => undefined} />)

    expect(html).toContain('class="page entry-page"')
  })
})
