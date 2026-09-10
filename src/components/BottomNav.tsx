import { Box, UnstyledButton, Text } from '@mantine/core'
import { ChartPie, CirclePlus, Home, WalletCards, Settings } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

export type PageKey = 'dashboard' | 'entry' | 'budget' | 'stats' | 'settings'

type BottomNavProps = {
  currentPage: PageKey
  onChange: (page: PageKey) => void
}

const items: Array<{ key: PageKey; label: string, icon: JSX.Element }> = [
  { key: 'dashboard', label: '首页' ,icon:<Home size={20} strokeWidth={2.2} />},
  { key: 'budget', label: '资金' ,icon:<WalletCards size={20} strokeWidth={2.2} />},
    { key: 'entry', label: '记账' ,icon:<CirclePlus size={20} strokeWidth={2.2} />},
  { key: 'stats', label: '统计' ,icon:<ChartPie size={20} strokeWidth={2.2} />},
  { key: 'settings', label: '设置' ,icon:<Settings size={20} strokeWidth={2.2} />}
]

export function BottomNav({ currentPage, onChange }: BottomNavProps) {
  return (
    <Box
      component="nav"
      bg="rgba(255, 255, 255, 0.95)"
      px="xs"
      pt="xs"
      pb="calc(12px + env(safe-area-inset-bottom))"
      style={{ flexShrink: 0, borderTop: '1px solid var(--book-border)', boxShadow: '0 -8px 28px rgb(32 47 43 / 7%)', backdropFilter: 'blur(16px)', zIndex: 100 }}
      aria-label="底部导航"
    >
      <Box display="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = currentPage === item.key
          return (
            <UnstyledButton key={item.key} py={4} c={active ? 'teal.7' : 'gray.6'} onClick={() => onChange(item.key)}>
              <Box display="flex" style={{ flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {item.icon}
                <Text size="xs" fw={active ? 700 : 500}>{item.label}</Text>
              </Box>
            </UnstyledButton>
          )
        })}
      </Box>
    </Box>
  )
}
