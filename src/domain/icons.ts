import type { PageKey } from '../components/BottomNav'

export type NavigationIconName = 'Home' | 'CirclePlus' | 'ChartPie' | 'Settings'
export type CategoryIconName =
  | 'Utensils'
  | 'Bus'
  | 'ShoppingBag'
  | 'House'
  | 'Gamepad2'
  | 'Cross'
  | 'CircleEllipsis'
  | 'Wallet'
  | 'TrendingUp'

const categoryEmojis: Record<string, string> = {
  餐饮: '🍜',
  购物: '🛍️',
  娱乐: '🎮',
  通讯: '📱',
  住房: '🏠',
  交通: '🚌',
  医疗: '💊',
  学习: '📚',
  转账: '↔️',
  旅行: '✈️',
  人情: '🤝',
  借出: '📤',
  工资: '💰',
  奖金: '🎁',
  兼职: '💼',
  红包: '🧧',
  利息: '🏦',
  副业: '💼',
  投资: '📈',
  其他: '✨'
}

const navigationIcons: Record<PageKey, NavigationIconName> = {
  dashboard: 'Home',
  entry: 'CirclePlus',
  stats: 'ChartPie',
  settings: 'Settings'
}

const categoryIcons: Record<string, CategoryIconName> = {
  餐饮: 'Utensils',
  交通: 'Bus',
  购物: 'ShoppingBag',
  住房: 'House',
  娱乐: 'Gamepad2',
  医疗: 'Cross',
  工资: 'Wallet',
  奖金: 'Wallet',
  副业: 'Wallet',
  投资: 'TrendingUp',
  其他: 'CircleEllipsis'
}

export function getNavigationIconName(page: PageKey): NavigationIconName {
  return navigationIcons[page]
}

export function getCategoryIconName(category: string): CategoryIconName {
  return categoryIcons[category] ?? 'CircleEllipsis'
}

export function getCategoryEmoji(category: string): string {
  return categoryEmojis[category] ?? '✨'
}
