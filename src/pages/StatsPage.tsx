import { useState } from 'react'
import { ExpenseCategoryChart, MonthlyTrendChart } from '../components/StatisticsCharts'
import { CollapsibleTransactionSearch } from '../components/CollapsibleTransactionSearch'
import { getAvailableStatYears, summarizeCategoriesByPrefix, summarizeYear, summarizeYearMonths } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth, currentYear } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { Box, Group, Paper, SegmentedControl, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core'

type StatsPageProps = {
  transactions: Transaction[]
  onOpenMonth: (month: string) => void
}

export function StatsPage({ transactions, onOpenMonth }: StatsPageProps) {
  const [year, setYear] = useState(currentYear())
  const [searchQuery, setSearchQuery] = useState('')
  const [expenseScope, setExpenseScope] = useState<'all' | 'daily'>('all')
  const hasSearchQuery = searchQuery.trim().length > 0
  const availableYears = getAvailableStatYears(transactions, currentMonth())
  const filteredTransactions = searchTransactions(transactions, searchQuery)
  const scopedTransactions = expenseScope === 'daily'
    ? filteredTransactions.filter((transaction) => transaction.type !== 'expense' || transaction.includeInBudget !== false)
    : filteredTransactions
  const summary = summarizeYear(scopedTransactions, year)
  const expenseCategories = summarizeCategoriesByPrefix(scopedTransactions, year, 'expense')
  const matchingMonths = new Set(
    scopedTransactions
      .filter((transaction) => transaction.occurredAt.startsWith(year))
      .map((transaction) => transaction.occurredAt.slice(0, 7))
  )
  const months = summarizeYearMonths(scopedTransactions, year, currentMonth())
    .filter((month) => !hasSearchQuery || matchingMonths.has(month.month))

  return (
    <Stack component="section" h="100%" mih={0} p="md" gap="md">
      <Stack gap="md" style={{ flexShrink: 0 }}>
        <Group justify="space-between" gap="md" wrap="nowrap">
          <Title order={2} size="h4">统计分析</Title>
          <Select
            w={150}
            radius="xl"
            aria-label="统计年份"
            value={year}
            data={availableYears.map((item) => ({ value: item, label: `${item}年` }))}
            onChange={(value) => value && setYear(value)}
          />
        </Group>

        <CollapsibleTransactionSearch value={searchQuery} onChange={setSearchQuery}>
          <SegmentedControl
            fullWidth
            data={[{ label: '全部支出', value: 'all' }, { label: '日常消费', value: 'daily' }]}
            value={expenseScope}
            onChange={(value) => setExpenseScope(value as 'all' | 'daily')}
          />
        </CollapsibleTransactionSearch>

        <Paper p="sm" radius="xl" shadow="xs">
          <SimpleGrid cols={3}>
            <SummaryItem label="总收入" value={formatMoney(summary.income)} color="teal.7" />
            <SummaryItem label={expenseScope === 'daily' ? '日常消费' : '总支出'} value={formatMoney(summary.expense)} color="red.6" />
            <SummaryItem label="结余" value={`${summary.balance >= 0 ? '+' : ''}${formatMoney(summary.balance)}`} />
          </SimpleGrid>
        </Paper>

      </Stack>

      <Stack component="section" mih={0} flex={1} gap="md" style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <MonthlyTrendChart months={months} expenseLabel={expenseScope === 'daily' ? '日常消费' : '支出'} />
          <ExpenseCategoryChart categories={expenseCategories} daily={expenseScope === 'daily'} />
        </SimpleGrid>

        <Group mt="xs" justify="space-between" align="flex-end">
          <Box><Text size="xs" fw={800} tt="uppercase" c="teal.7">账目明细</Text><Title order={2} size="h4">{hasSearchQuery ? '搜索结果' : '月度明细'}</Title></Box>
          <Text size="xs" c="dimmed">{months.length} 个月</Text>
        </Group>
        {months.length === 0 && hasSearchQuery ? (
          <Paper p="xl" radius="xl"><Text ta="center" c="dimmed">这一年没有找到匹配的账单</Text></Paper>
        ) : (
          <Stack gap="xs">
            {months.map((month) => (
              <Paper component="button" w="100%" p="md" radius="lg" shadow="xs" ta="left" c="inherit" key={month.month} type="button" onClick={() => onOpenMonth(month.month)}>
                <SimpleGrid cols={4} spacing="xs" style={{ alignItems: 'center' }}>
                  <Text fw={700}>{month.label}</Text>
                  <SummaryItem label="收入" value={formatMoney(month.income)} color="teal.7" compact />
                  <SummaryItem label={expenseScope === 'daily' ? '日常消费' : '支出'} value={formatMoney(month.expense)} color="red.6" compact />
                  <SummaryItem label="结余" value={formatMoney(month.balance)} compact />
                </SimpleGrid>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

function SummaryItem({ label, value, color, compact = false }: { label: string; value: string; color?: string; compact?: boolean }) {
  return <Stack gap={2} ta="center"><Text size="xs" c="dimmed">{label}</Text><Text size={compact ? 'xs' : 'sm'} fw={700} c={color}>{value}</Text></Stack>
}
