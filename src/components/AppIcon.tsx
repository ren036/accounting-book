import {
  Bus,
  ChartPie,
  CircleEllipsis,
  CirclePlus,
  Cross,
  Gamepad2,
  Home,
  House,
  Settings,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet
} from 'lucide-react'
import type { CategoryIconName, NavigationIconName } from '../domain/icons'

type IconName = CategoryIconName | NavigationIconName

type AppIconProps = {
  name: IconName
  size?: number
  className?: string
}

const icons = {
  Bus,
  ChartPie,
  CircleEllipsis,
  CirclePlus,
  Cross,
  Gamepad2,
  Home,
  House,
  Settings,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Wallet
}

export function AppIcon({ name, size = 20, className }: AppIconProps) {
  const Icon = icons[name]
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={2.2} />
}
