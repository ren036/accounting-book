import { getNavigationIconName } from '../domain/icons'
import { AppIcon } from './AppIcon'

export type PageKey = 'dashboard' | 'entry' | 'stats' | 'settings'

type BottomNavProps = {
  currentPage: PageKey
  onChange: (page: PageKey) => void
}

const items: Array<{ key: PageKey; label: string }> = [
  { key: 'dashboard', label: '首页' },
  { key: 'entry', label: '记账' },
  { key: 'stats', label: '统计' },
  { key: 'settings', label: '设置' }
]

export function BottomNav({ currentPage, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="底部导航">
      {items.map((item) => (
        <button
          key={item.key}
          className={currentPage === item.key ? 'active' : ''}
          type="button"
          onClick={() => onChange(item.key)}
        >
          <AppIcon name={getNavigationIconName(item.key)} size={20} />
          {item.label}
        </button>
      ))}
    </nav>
  )
}
