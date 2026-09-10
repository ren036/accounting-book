import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { CategoryEmoji, getCategoryVisual } from './CategoryEmoji'
import { Badge, Center, Group, Stack, Text, UnstyledButton } from '@mantine/core'

type TransactionRowProps = {
  transaction: Transaction
  onOpen: (id: string) => void
}

export function TransactionRow({ transaction, onOpen }: TransactionRowProps) {
  const note = getTransactionNoteDisplay(transaction.note)
  const isIncome = transaction.type === 'income'
  const isExcludedFromBudget = !isIncome && transaction.includeInBudget === false
  const categoryVisual = getCategoryVisual(transaction.category)

  return (
    <UnstyledButton
      component="button"
      type="button"
      className="transaction-row"
      bg={isExcludedFromBudget ? 'var(--mantine-color-yellow-light)' : undefined}
      onClick={() => onOpen(transaction.id)}
    >
      <Group justify="space-between" gap="sm" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" miw={0} pl='xs'>
          <Center w={34} h={34} style={{ flexShrink: 0, borderRadius: '50%', background: categoryVisual.color }}>
            <CategoryEmoji category={transaction.category} size={18} color="white" />
          </Center>
          <Stack gap={1} miw={0}>
            <Group gap={6} wrap="nowrap">
              <Text size="sm" fw={650}>{transaction.category}</Text>
              {isExcludedFromBudget && <Badge color="yellow" variant="light" size="xs" radius="sm">非日常</Badge>}
            </Group>
            {note && <Text size="xs" c="dimmed" truncate>{note}</Text>}
          </Stack>
        </Group>
        <Text pr='xs' size="sm" fw={700} c={isIncome ? 'teal.7' : 'red.6'} style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
        </Text>
      </Group>
    </UnstyledButton>
  )
}
