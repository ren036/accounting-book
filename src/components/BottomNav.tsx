import { TabBar } from 'antd-mobile'
import { ChartPie, CirclePlus, Home, Settings } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

export type PageKey = 'dashboard' | 'entry' | 'stats' | 'settings'

type BottomNavProps = {
  currentPage: PageKey
  onChange: (page: PageKey) => void
}

const items: Array<{ key: PageKey; label: string, icon: JSX.Element }> = [
  { key: 'dashboard', label: '首页' ,icon:<Home size={20} strokeWidth={2.2} />},
  { key: 'entry', label: '记账' ,icon:<CirclePlus size={20} strokeWidth={2.2} />},
  { key: 'stats', label: '统计' ,icon:<ChartPie size={20} strokeWidth={2.2} />},
  { key: 'settings', label: '设置' ,icon:<Settings size={20} strokeWidth={2.2} />}
]

export function BottomNav({ currentPage, onChange }: BottomNavProps) {
  return (
    <TabBar
      className="fixed inset-x-0 bottom-0 mx-auto max-w-[720px] bg-white/90 px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_16px_40px_rgb(15_23_42/18%)] [&_.adm-tab-bar-item-title]:whitespace-nowrap"
      activeKey={currentPage}
      aria-label="底部导航"
      onChange={(key) => onChange(key as PageKey)}
    >
      
      {items.map((item) => (
        <TabBar.Item
          key={item.key}
          icon={item.icon}
          title={item.label}
        />
      ))}
    </TabBar>
  )
}
