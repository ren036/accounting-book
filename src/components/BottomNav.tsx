import { Paper, SimpleGrid, Stack, UnstyledButton, Text } from '@mantine/core'
import { ChartPie, CirclePlus, Home, WalletCards, Settings, type LucideIcon } from 'lucide-react'

export type PageKey = 'dashboard' | 'entry' | 'budget' | 'stats' | 'settings'

type BottomNavProps = {
  currentPage: PageKey
  onChange: (page: PageKey) => void
}

const items: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: 'dashboard', label: '首页', icon: Home },
  { key: 'budget', label: '资金', icon: WalletCards },
  { key: 'entry', label: '记账', icon: CirclePlus },
  { key: 'stats', label: '统计', icon: ChartPie },
  { key: 'settings', label: '设置', icon: Settings },
]

export function BottomNav({ currentPage, onChange }: BottomNavProps) {
  return (
    <Paper
      component="nav"
      radius={0}
      shadow="md"
      bg="rgba(255, 255, 255, 0.95)"
      px="xs"
      pt="xs"
      pb="calc(12px + env(safe-area-inset-bottom))"
      style={{ flexShrink: 0, borderTop: '1px solid var(--book-border)', backdropFilter: 'blur(16px)', zIndex: 100 }}
      aria-label="底部导航"
    >
      <SimpleGrid cols={items.length} spacing={0}>
        {items.map((item) => {
          const active = currentPage === item.key
          const Icon = item.icon
          return (
            <UnstyledButton key={item.key} py={4} c={active ? 'teal.7' : 'gray.6'} aria-current={active ? 'page' : undefined} onClick={() => onChange(item.key)}>
              <Stack align="center" gap={2}>
                <Icon size={20} strokeWidth={2.2} />
                <Text size="xs" fw={active ? 700 : 500}>{item.label}</Text>
              </Stack>
            </UnstyledButton>
          )
        })}
      </SimpleGrid>
    </Paper>
  )
}
