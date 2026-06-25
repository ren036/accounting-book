import { describe, expect, it } from 'vitest'
import { getCategoryEmoji, getNavigationIconName } from '../domain/icons'

describe('icon mappings', () => {
  it('maps navigation pages to lucide icon names', () => {
    expect(getNavigationIconName('dashboard')).toBe('Home')
    expect(getNavigationIconName('entry')).toBe('CirclePlus')
    expect(getNavigationIconName('stats')).toBe('ChartPie')
    expect(getNavigationIconName('settings')).toBe('Settings')
  })

  it('maps known categories to emoji and falls back for unknown categories', () => {
    expect(getCategoryEmoji('餐饮')).toBe('🍜')
    expect(getCategoryEmoji('交通')).toBe('🚌')
    expect(getCategoryEmoji('购物')).toBe('🛍️')
    expect(getCategoryEmoji('住房')).toBe('🏠')
    expect(getCategoryEmoji('工资')).toBe('💰')
    expect(getCategoryEmoji('未知')).toBe('✨')
  })
})
