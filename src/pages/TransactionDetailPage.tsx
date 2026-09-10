import { ActionIcon, Box, Button, Center, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { CategoryEmoji } from '../components/CategoryEmoji'
import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { confirmAction } from '../ui/feedback'

type TransactionDetailPageProps = {
  transaction: Transaction
  onBack: () => void
  onDeleted: (id: string) => Promise<void>
  onEdit: () => void
}

export function TransactionDetailPage({ transaction, onBack, onDeleted, onEdit }: TransactionDetailPageProps) {
  const isIncome = transaction.type === 'income'
  const note = getTransactionNoteDisplay(transaction.note)

  async function handleDelete() {
    const confirmed = await confirmAction({
      message: '确定删除这笔账单吗？',
      confirmLabel: '删除',
      cancelLabel: '取消',
      destructive: true,
    })

    if (confirmed) await onDeleted(transaction.id)
  }

  return (
    <Box component="section" p="md">
      <Group justify="space-between" mb="md">
        <ActionIcon color="dark" variant="subtle" size="lg" aria-label="返回" onClick={onBack}>
          <ArrowLeft size={22} />
        </ActionIcon>
        <Title order={2} size="h4">账单详情</Title>
        <ActionIcon color="red" variant="subtle" size="lg" aria-label="删除账单" onClick={handleDelete}>
          <Trash2 size={21} />
        </ActionIcon>
      </Group>

      <Paper component="article" p="lg" radius="xl" shadow="xs">
        <Stack gap="xl">
        <Center>
          <Stack align="center" gap={6} py="sm">
          <Group gap="xs">
            <CategoryEmoji category={transaction.category} />
            {transaction.category}
          </Group>
          <Text fw={700} fz={38} c={isIncome ? 'teal.7' : 'red.6'}>
            {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
          </Text>
          <Text size="sm" c="dimmed">{isIncome ? '收入' : '支出'}</Text>
          </Stack>
        </Center>

        <Stack gap={0}>
          <DetailRow label="日期" value={transaction.occurredAt.slice(0, 10)} />
          <DetailRow label="备注" value={note ?? '无备注'} />
          {!isIncome && <DetailRow label="日常消费" value={transaction.includeInBudget !== false ? '计入' : '不计入（非日常支出）'} />}
        </Stack>

        <Button color="teal" variant="outline" radius="xl" type="button" onClick={onEdit}>编辑</Button>
        </Stack>
      </Paper>
    </Box>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Divider />
      <Group justify="space-between" gap="xl" py="md" wrap="nowrap">
        <Text component="dt">{label}</Text>
        <Text component="dd" ta="right" m={0}>{value}</Text>
      </Group>
    </>
  )
}
