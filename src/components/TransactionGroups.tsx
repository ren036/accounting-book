import { Box, Stack, Text } from '@mantine/core'
import type { DailyTransactionGroup } from '../domain/summary'
import { TransactionRow } from './TransactionRow'

export function TransactionGroups({
  groups,
  onOpen,
}: {
  groups: DailyTransactionGroup[]
  onOpen: (id: string) => void
}) {
  return (
    <Stack gap="xs">
      {groups.map((group) => (
        <section key={group.date}>
          <Text size="sm" c="dimmed" fw={600} px='xs'>{group.label}</Text>
          <Box className="transaction-list">
            {group.transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} onOpen={onOpen} />
            ))}
          </Box>
        </section>
      ))}
    </Stack>
  )
}
