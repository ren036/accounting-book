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
})
