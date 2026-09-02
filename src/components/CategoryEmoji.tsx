import {
  BookOpen, BriefcaseBusiness, Bus, CircleEllipsis, Gamepad2, Gift, HandCoins,
  HeartPulse, House, Landmark, type LucideIcon, MessageSquareMore, Plane, Send,
  ShoppingBag, TrendingUp, Utensils, WalletCards,
} from 'lucide-react'

type CategoryVisual = { icon: LucideIcon; color: string; background: string }
type CategoryEmojiProps = { category: string; size?: number }

const fallback: CategoryVisual = { icon: CircleEllipsis, color: '#6f727c', background: '#f0f1f4' }

const visuals: Record<string, CategoryVisual> = {
  餐饮: { icon: Utensils, color: '#f97316', background: '#fff2e8' },
  购物: { icon: ShoppingBag, color: '#8b5cf6', background: '#f3efff' },
  娱乐: { icon: Gamepad2, color: '#ec4899', background: '#fff0f7' },
  通讯: { icon: MessageSquareMore, color: '#0ea5e9', background: '#eaf7fd' },
  住房: { icon: House, color: '#07a86b', background: '#eaf9f1' },
  交通: { icon: Bus, color: '#3b82f6', background: '#edf5ff' },
  医疗: { icon: HeartPulse, color: '#ef4444', background: '#fff0f0' },
  学习: { icon: BookOpen, color: '#6366f1', background: '#f0f1ff' },
  转账: { icon: Send, color: '#14b8a6', background: '#eafaf8' },
  旅行: { icon: Plane, color: '#0284c7', background: '#eaf7ff' },
  人情: { icon: HandCoins, color: '#eab308', background: '#fff9df' },
  借出: { icon: WalletCards, color: '#f43f5e', background: '#fff0f3' },
  工资: { icon: BriefcaseBusiness, color: '#07a86b', background: '#eaf9f1' },
  奖金: { icon: Gift, color: '#f97316', background: '#fff2e8' },
  兼职: { icon: WalletCards, color: '#3b82f6', background: '#edf5ff' },
  红包: { icon: Gift, color: '#ef4444', background: '#fff0f0' },
  利息: { icon: Landmark, color: '#8b5cf6', background: '#f3efff' },
  投资: { icon: TrendingUp, color: '#07a86b', background: '#eaf9f1' },
  其他: fallback,
}

export function getCategoryVisual(category: string): CategoryVisual {
  return visuals[category] ?? fallback
}

export function CategoryEmoji({ category, size = 21 }: CategoryEmojiProps) {
  const visual = getCategoryVisual(category)
  const Icon = visual.icon
  return <Icon aria-hidden="true" color={visual.color} size={size} strokeWidth={2} />
}
