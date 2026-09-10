import { Box, Stack, Text } from '@mantine/core'
import type { Transaction } from '../domain/transaction'
import { TransactionRow } from './TransactionRow'

type TransactionGroup = {
  date: string
  label: string
  transactions: Transaction[]
}

export function TransactionGroups({
  groups,
  onOpen,
}: {
  groups: TransactionGroup[]
  onOpen: (id: string) => void
}) {
  return (
    <Stack gap="md">
      {groups.map((group) => (
        <section key={group.date}>
          <Text mb={6} size="sm" c="dimmed" fw={600}>{group.label}</Text>
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
