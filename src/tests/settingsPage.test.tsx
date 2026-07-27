import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SettingsPage } from '../pages/SettingsPage'

vi.mock('antd-mobile', () => ({
  Dialog: {
    confirm: vi.fn()
  }
}))

describe('SettingsPage', () => {
  it('renders a separate import button next to backup import controls', () => {
    const html = renderToStaticMarkup(<SettingsPage onChanged={async () => undefined} />)

    expect(html).toContain('>导入备份<')
    expect(html).toContain('type="file"')
    expect(html).toContain('>导入<')
    expect(html).toContain('disabled=""')
  })
})
