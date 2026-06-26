import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TransactionForm } from '../components/TransactionForm'
import { todayInputValue } from '../lib/dates'

describe('TransactionForm', () => {
  it('limits the date input to today or earlier', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain(`max="${todayInputValue()}"`)
  })

  it('autofocuses the amount input when creating a transaction', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('autofocus=""')
  })

  it('uses a contained native date input', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('class="native-date-input"')
    expect(html).toContain('type="date"')
  })

  it('renders category icon buttons instead of a category select', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('class="category-picker"')
    expect(html).toContain('data-scroll="vertical"')
    expect(html).toContain('data-layout="responsive"')
    expect(html).not.toContain('class="category-picker-page"')
    expect(html).toContain('class="category-icon-button active"')
    expect(html).not.toContain('class="category-option active"')
    expect(html).toContain('餐饮')
    expect(html).toContain('通讯')
    expect(html).not.toContain('<select')
  })
})
