import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { CategoryEmoji, getCategoryVisual } from './CategoryEmoji'
import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core'

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
    <Paper
      component="button"
      type="button"
      w="100%"
      px="md"
      py="xs"
      radius="lg"
      ta="left"
      c="inherit"
      shadow='xs'
      bg={isExcludedFromBudget ? 'yellow.0' : 'rgba(255,255,255,.9)'}
      withBorder={isExcludedFromBudget}
      style={{ borderColor: isExcludedFromBudget ? 'var(--mantine-color-yellow-3)' : 'transparent' }}
      onClick={() => onOpen(transaction.id)}
    >
      <Group justify="space-between" gap="sm" wrap="nowrap">
      <Group gap="sm" wrap="nowrap" miw={0}>
        <Box w={36} h={36} display="grid" style={{ flexShrink: 0, placeItems: 'center', borderRadius: '50%', background: categoryVisual.background }}>
          <CategoryEmoji category={transaction.category} size={19} />
        </Box>
        <Stack gap={1} miw={0}>
          <Group gap={6} wrap="nowrap">
            <Text size="sm" fw={650}>{transaction.category}</Text>
            {isExcludedFromBudget && <Badge color="yellow" variant="light" size="xs" radius="sm">非日常</Badge>}
          </Group>
          {note && <Text size="xs" c="dimmed" truncate>{note}</Text>}
        </Stack>
      </Group>
      <Text size="sm" fw={700} c={isIncome ? 'teal.7' : 'red.6'} style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
        {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
      </Text>
      </Group>
    </Paper>
  )
}
