import { Stack, Text } from '@mantine/core'
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
          <Text mb="xs" size="sm" c="dimmed" fw={600}>{group.label}</Text>
          <Stack gap="xs">
            {group.transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} onOpen={onOpen} />
            ))}
          </Stack>
        </section>
      ))}
    </Stack>
  )
}
