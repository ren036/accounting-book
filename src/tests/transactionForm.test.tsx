import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AmountInput } from '../components/AmountInput'
import { TransactionForm } from '../components/TransactionForm'
import { todayInputValue } from '../lib/dates'

const styles = readFileSync('src/styles.css', 'utf8')

describe('TransactionForm', () => {
  it('renders header, body, and footer sections', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('class="card form transaction-form"')
    expect(html).toContain('class="transaction-form-header"')
    expect(html).toContain('class="transaction-form-body"')
    expect(html).toContain('class="transaction-form-footer"')
  })

  it('limits the date input to today or earlier', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain(`max="${todayInputValue()}"`)
  })

  it('autofocuses the amount input when creating a transaction', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('autofocus=""')
  })

  it('allows amount calculation expressions', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('inputMode="none"')
    expect(html).toContain('placeholder="0.00 或 1+2"')
    expect(html).toContain('pattern="[0-9+\\-.\\s]*"')
  })

  it('renders a custom amount keyboard for mobile entry', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    expect(html).toContain('class="amount-keyboard"')
    expect(html).toContain('aria-label="金额键盘"')
    expect(html).toContain('aria-label="输入 +"')
    expect(html).toContain('aria-label="输入 -"')
    expect(html).toContain('aria-label="删除一位"')
    expect(html).toContain('aria-label="计算金额"')
    expect(html).toContain('readOnly=""')
    expect(html.indexOf('>1</button>')).toBeLessThan(html.indexOf('>7</button>'))
  })

  it('keeps the amount keyboard outside the scrollable form body', () => {
    const html = renderToStaticMarkup(<TransactionForm onSubmit={async () => undefined} />)

    const bodyEnd = html.indexOf('class="transaction-form-footer')
    const keyboard = html.indexOf('class="amount-keyboard"')
    expect(keyboard).toBeGreaterThan(bodyEnd)
    expect(styles).toMatch(/\.transaction-form-body\s*{[^}]*overflow-y:\s*auto;/s)
  })

  it('shows calculated amount results while editing an expression', () => {
    const html = renderToStaticMarkup(<AmountInput value="1+1" onChange={() => undefined} />)

    expect(html).toContain('class="amount-result"')
    expect(html).toContain('= 2')
  })

  it('distinguishes a zero result from an unfinished expression', () => {
    const html = renderToStaticMarkup(<AmountInput value="1-1" onChange={() => undefined} />)

    expect(html).toContain('= 0')
    expect(html).not.toContain('算式未完成')
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

  it('keeps focused field outlines visible inside the scrollable body', () => {
    expect(styles).toMatch(/\.transaction-form-body\s*{[^}]*padding-inline:\s*2px;/s)
  })
})
