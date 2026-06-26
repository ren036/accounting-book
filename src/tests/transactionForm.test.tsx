import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { TransactionForm } from '../components/TransactionForm'
import { todayInputValue } from '../lib/dates'

describe('TransactionForm', () => {
  it('limits the date input to today or earlier', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain(`max="${todayInputValue()}"`)
  })
})
