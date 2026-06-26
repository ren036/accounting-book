import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TransactionForm } from '../components/TransactionForm'
import { todayInputValue } from '../lib/dates'

describe('TransactionForm', () => {
  it('shows today as the default transaction date', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain(`>${todayInputValue()}<`)
  })

  it('autofocuses the amount input when creating a transaction', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('autofocus=""')
  })

  it('uses a mobile date picker instead of a native date input', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).not.toContain('type="date"')
    expect(html).toContain('class="date-picker-trigger"')
  })
})
