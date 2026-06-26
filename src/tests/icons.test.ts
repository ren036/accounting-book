import { describe, expect, it } from 'vitest'
import { expenseCategories, incomeCategories } from '../domain/categories'
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
    expect(getCategoryEmoji('购物')).toBe('🛍️')
    expect(getCategoryEmoji('通讯')).toBe('📱')
    expect(getCategoryEmoji('学习')).toBe('📚')
    expect(getCategoryEmoji('转账')).toBe('🔁')
    expect(getCategoryEmoji('旅行')).toBe('✈️')
    expect(getCategoryEmoji('人情')).toBe('🤝')
    expect(getCategoryEmoji('借出')).toBe('↗️')
    expect(getCategoryEmoji('住房')).toBe('🏠')
    expect(getCategoryEmoji('工资')).toBe('💰')
    expect(getCategoryEmoji('未知')).toBe('✨')
  })

  it('uses the requested entry category lists', () => {
    expect(expenseCategories).toEqual(['餐饮', '购物', '娱乐', '通讯', '住房', '交通', '医疗', '学习', '转账', '旅行', '人情', '借出', '其他'])
    expect(incomeCategories).toEqual(['工资', '奖金', '兼职', '红包', '利息', '其他'])
  })
})
