import { useMemo, useState } from 'react'
import { CollapsibleTransactionSearch } from '../components/CollapsibleTransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { CategoryChart } from '../components/StatisticsCharts'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget } from '../domain/budget'
import { filterMonthTransactionsByType, groupMonthTransactionsByDay, summarizeCategoriesByPrefix, summarizeMonth } from '../domain/summary'
import type { Transaction, TransactionType } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth, shiftMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { ActionIcon, Box, Group, Paper, Progress, SegmentedControl, Select, SimpleGrid, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'

type MonthTransactionsPageProps = {
  month: string
  transactions: Transaction[]
  budget?: MonthlyBudget
  onBack: () => void
  onChangeMonth: (month: string) => void
  onOpen: (id: string) => void
}

export function MonthTransactionsPage({ month, transactions, budget, onBack, onChangeMonth, onOpen }: MonthTransactionsPageProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [searchQuery, setSearchQuery] = useState('')
  const selectableMonths = useMemo(() => {
    const recordedMonths = transactions
      .map((transaction) => transaction.occurredAt.slice(0, 7))
      .filter((value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value))
    const boundaries = [...recordedMonths, currentMonth(), month].sort()
    const oldestMonth = boundaries[0]
    const newestMonth = boundaries.at(-1) ?? month
    const options: string[] = []

    for (let value = newestMonth; value >= oldestMonth; value = shiftMonth(value, -1)) {
      options.push(value)
    }
    return options
  }, [month, transactions])
  const summary = summarizeMonth(transactions, month)
  const budgetProgress = budget ? summarizeBudget(transactions, budget) : null
  const budgetBarPercentage = budgetProgress ? Math.min(Math.max(budgetProgress.percentage, 0), 100) : 0
  const filteredTransactions = searchTransactions(
    filterMonthTransactionsByType(transactions, month, activeType),
    searchQuery
  )
  const categories = summarizeCategoriesByPrefix(filteredTransactions, month, activeType)
  const groups = groupMonthTransactionsByDay(filteredTransactions, month)
  const emptyText = searchQuery.trim()
    ? '没有找到匹配的账单'
    : activeType === 'expense' ? '这个月还没有支出' : '这个月还没有收入'
  const changeMonth = (nextMonth: string) => {
    setSearchQuery('')
    onChangeMonth(nextMonth)
  }

  return (
    <Stack component="section" h="100%" mih={0} gap="xs" p="md" pt="xs" pb={0}>
      <Stack gap="xs" style={{ flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <ActionIcon color="dark" variant="subtle" size="lg" aria-label="返回" onClick={onBack}><ArrowLeft size={22} /></ActionIcon>
          <Select
            w={210}
            radius="xl"
            aria-label="选择账单月份"
            value={month}
            data={selectableMonths.map((value) => ({ value, label: `${value.replace('-', '年')}月账单` }))}
            onChange={(value) => value && changeMonth(value)}
            allowDeselect={false}
          />
          <Box w={36} aria-hidden="true" />
        </Group>

        <Paper p="sm" radius="xl" shadow="xs"><SimpleGrid cols={3}>
          <SummaryItem label="收入" value={formatMoney(summary.income)} color="teal.7" />
          <SummaryItem label="支出" value={formatMoney(summary.expense)} color="red.6" />
          <SummaryItem label="结余" value={formatMoney(summary.balance)} />
        </SimpleGrid></Paper>
        <Paper p="sm" radius="xl" shadow="xs">
          <Stack gap={6}>
          <Group justify="space-between" align="flex-end">
            <Group gap="xs"><Text size="sm" c="dimmed">本月预算</Text><Text fw={700}>{budget ? formatMoney(budget.amount) : '未设置'}</Text></Group>
            {budgetProgress && <Text fw={700} c={budgetProgress.remaining < 0 ? 'red.6' : 'teal.7'}>{budgetProgress.percentage.toFixed(0)}%</Text>}
          </Group>
          {budgetProgress && (
            <>
              <Progress value={budgetBarPercentage} color={budgetProgress.percentage > 100 ? 'red' : 'teal'} size={6} radius="xl" aria-label="预算使用进度" />
              <Group justify="space-between"><Text size="xs" c="dimmed">日常消费 {formatMoney(budgetProgress.spent)}</Text><Text size="xs" c="dimmed">{budgetProgress.remaining < 0 ? '超出' : '剩余'} {formatMoney(Math.abs(budgetProgress.remaining))}</Text></Group>
            </>
          )}
          </Stack>
        </Paper>
        <CollapsibleTransactionSearch value={searchQuery} onChange={setSearchQuery}>
          <SegmentedControl fullWidth data={[
            { label: '支出', value: 'expense' },
            { label: '收入', value: 'income' },
          ]}
            value={activeType}
            onChange={(value) => setActiveType(value as TransactionType)}
          />
        </CollapsibleTransactionSearch>
      </Stack>

      <Stack component="section" mih={0} flex={1} gap="sm" pb="md" style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <CategoryChart
          categories={categories}
          eyebrow="月度构成"
          title={`${activeType === 'expense' ? '支出' : '收入'}分类`}
          totalLabel={`总${activeType === 'expense' ? '支出' : '收入'}`}
        />
        {groups.length === 0 ? (
          <Paper p="xl" radius="xl"><Text ta="center" c="dimmed">{emptyText}</Text></Paper>
        ) : (
          <Stack gap="md">
            {groups.map((group) => (
              <Stack component="section" gap="xs" key={group.date}>
                <Text size="sm" c="dimmed" fw={600}>{group.label}</Text>
                <Stack gap="xs">
                  {group.transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} onOpen={onOpen} />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return <Stack gap={2} ta="center"><Text size="xs" c="dimmed">{label}</Text><Text size="sm" fw={700} c={color}>{value}</Text></Stack>
}
