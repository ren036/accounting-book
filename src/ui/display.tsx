import { Box, Stack, Text } from '@mantine/core'

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <Box py={36} ta="center" c="dimmed">{children}</Box>
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
