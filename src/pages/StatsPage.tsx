import { ExpenseCategoryChart, MonthlyTrendChart } from '../components/StatisticsCharts'
import { getAvailableStatYears, summarizeCategoriesByPrefix, summarizeYear, summarizeYearMonths } from '../domain/summary'
import { filterTransactionsByScope, filterTransactionsByYear, type Transaction, type TransactionScope } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { Box, Button, Group, Paper, SegmentedControl, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { Search } from 'lucide-react'
import { SummaryMetric } from '../ui/display'
import { PageLayout } from '../ui/layout'

type StatsPageProps = {
  transactions: Transaction[]
  year: string
  expenseScope: TransactionScope
  onYearChange: (value: string) => void
  onExpenseScopeChange: (value: TransactionScope) => void
  onOpenMonth: (month: string) => void
  onOpenSearch: () => void
}

export function StatsPage({ transactions, year, expenseScope, onYearChange, onExpenseScopeChange, onOpenMonth, onOpenSearch }: StatsPageProps) {
  const availableYears = getAvailableStatYears(transactions, currentMonth())
  const yearTransactions = filterTransactionsByYear(filterTransactionsByScope(transactions, expenseScope), year)
  const summary = summarizeYear(yearTransactions, year)
  const expenseCategories = summarizeCategoriesByPrefix(yearTransactions, year, 'expense')
  const months = summarizeYearMonths(yearTransactions, year, currentMonth())

  return (
    <PageLayout header={<>
        <Group justify="space-between" gap="md" wrap="nowrap">
          <Title order={2} size="h4">统计分析</Title>
          <Group gap="xs" wrap="nowrap">
            <Button variant="subtle" color="gray" size="compact-sm" leftSection={<Search size={16} aria-hidden />} onClick={onOpenSearch}>搜索账单</Button>
            <Select
              w={110}
              aria-label="统计年份"
              value={year}
              data={availableYears.map((item) => ({ value: item, label: `${item}年` }))}
              onChange={(value) => value && onYearChange(value)}
            />
          </Group>
        </Group>

        <SegmentedControl
          fullWidth
          data={[{ label: '全部支出', value: 'all' }, { label: '日常消费', value: 'daily' }]}
          value={expenseScope}
          onChange={(value) => onExpenseScopeChange(value as TransactionScope)}
        />

        <Paper p="sm">
          <SimpleGrid cols={3}>
            <SummaryMetric label="总收入" value={formatMoney(summary.income)} color="teal.7" />
            <SummaryMetric label={expenseScope === 'daily' ? '日常消费' : '总支出'} value={formatMoney(summary.expense)} color="red.6" />
            <SummaryMetric label="结余" value={`${summary.balance >= 0 ? '+' : ''}${formatMoney(summary.balance)}`} />
          </SimpleGrid>
        </Paper>

      </>}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <MonthlyTrendChart months={months} expenseLabel={expenseScope === 'daily' ? '日常消费' : '支出'} />
          <ExpenseCategoryChart categories={expenseCategories} daily={expenseScope === 'daily'} />
        </SimpleGrid>

        <Group mt="xs" justify="space-between" align="flex-end">
          <Box><Text size="xs" fw={600} c="dimmed">账目明细</Text><Title order={2} size="h4">月度明细</Title></Box>
          <Text size="xs" c="dimmed">{months.length} 个月</Text>
        </Group>
        <Stack gap="xs">
          {months.map((month) => (
            <Paper component="button" w="100%" p="md" radius="lg" ta="left" c="inherit" key={month.month} type="button" onClick={() => onOpenMonth(month.month)}>
              <SimpleGrid cols={4} spacing="xs" style={{ alignItems: 'center' }}>
                <Text fw={700}>{month.label}</Text>
                <SummaryMetric label="收入" value={formatMoney(month.income)} color="teal.7" compact />
                <SummaryMetric label={expenseScope === 'daily' ? '日常消费' : '支出'} value={formatMoney(month.expense)} color="red.6" compact />
                <SummaryMetric label="结余" value={formatMoney(month.balance)} compact />
              </SimpleGrid>
            </Paper>
          ))}
        </Stack>
    </PageLayout>
  )
}
