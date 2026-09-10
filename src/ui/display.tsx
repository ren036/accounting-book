import { Paper, Stack, Text } from '@mantine/core'

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <Paper p="xl" ta="center" c="dimmed">{children}</Paper>
}

export function SummaryMetric({
  label,
  value,
  color,
  compact = false,
}: {
  label: string
  value: string
  color?: string
  compact?: boolean
}) {
  return (
    <Stack gap={2} ta="center">
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size={compact ? 'xs' : 'sm'} fw={700} c={color}>{value}</Text>
    </Stack>
  )
}
