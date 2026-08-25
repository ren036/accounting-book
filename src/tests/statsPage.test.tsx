import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StatsPage } from '../pages/StatsPage'

describe('StatsPage', () => {
  it('renders transaction search in annual statistics', () => {
    const html = renderToStaticMarkup(<StatsPage transactions={[]} onOpenMonth={() => undefined} />)

    expect(html).toContain('aria-label="搜索账单"')
    expect(html).toContain('placeholder="搜索分类、备注、金额或日期"')
    expect(html).toContain('月度明细')
    expect(html).toContain('月度收支')
    expect(html).toContain('支出分类')
    expect(html).toContain('aria-label="统计年份"')
  })
})
