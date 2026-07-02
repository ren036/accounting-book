import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from '../pages/DashboardPage'

const styles = readFileSync('src/styles.css', 'utf8')

describe('DashboardPage', () => {
  it('renders the monthly transaction section', () => {
    const html = renderToStaticMarkup(<DashboardPage transactions={[]} onEdit={() => undefined} />)

    expect(html).toContain('class="dashboard-transactions fixed-list-content"')
    expect(html).toContain('当月账单详情')
  })

  it('keeps sparse monthly transactions aligned to the top', () => {
    expect(styles).toMatch(/\.dashboard-transactions\s*{[^}]*align-content:\s*start;/s)
  })
})
