import { ActionIcon, Box, Group, SegmentedControl, Select, Stack, Text, TextInput, Title } from '@mantine/core'
import { ArrowLeft, Search, X } from 'lucide-react'
import { TransactionGroups } from '../components/TransactionGroups'
import { getAvailableStatYears, groupTransactionsByDay } from '../domain/summary'
import { filterTransactionsByScope, filterTransactionsByYear, searchTransactions, type Transaction, type TransactionScope } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { EmptyState } from '../ui/display'
import { PageLayout } from '../ui/layout'

type TransactionSearchPageProps = {
  transactions: Transaction[]
  query: string
  year: string
  expenseScope: TransactionScope
  onQueryChange: (value: string) => void
  onYearChange: (value: string) => void
  onExpenseScopeChange: (value: TransactionScope) => void
  onOpen: (id: string) => void
  onBack: () => void
}

export function TransactionSearchPage({ transactions, query, year, expenseScope, onQueryChange, onYearChange, onExpenseScopeChange, onOpen, onBack }: TransactionSearchPageProps) {
  const availableYears = getAvailableStatYears(transactions, currentMonth())
  const results = searchTransactions(filterTransactionsByYear(filterTransactionsByScope(transactions, expenseScope), year), query)
  const groups = groupTransactionsByDay(results)

  return (
    <PageLayout gap="sm" headerGap="sm" contentGap="sm" paddingTop="xs" header={<>
      <Group justify="space-between" wrap="nowrap">
        <ActionIcon color="dark" variant="subtle" size="lg" aria-label="返回统计页" onClick={onBack}><ArrowLeft size={22} /></ActionIcon>
        <Title order={2} size="h4">搜索账单</Title>
        <Box w={36} aria-hidden="true" />
      </Group>
      <TextInput
        autoFocus
        aria-label="搜索账单"
        leftSection={<Search aria-hidden="true" size={19} strokeWidth={2.2} />}
        rightSection={query ? <ActionIcon color="ink" variant="light" size="sm" aria-label="清空搜索" onClick={() => onQueryChange('')}><X aria-hidden="true" size={15} /></ActionIcon> : undefined}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="搜索分类、备注、金额或收支类型"
        type="search"
        value={query}
        size="md"
      />
      <Group grow wrap="nowrap">
        <Select
          aria-label="筛选年份"
          value={year}
          data={availableYears.map((item) => ({ value: item, label: `${item}年` }))}
          onChange={(value) => value && onYearChange(value)}
          allowDeselect={false}
        />
        <SegmentedControl
          fullWidth
          data={[{ label: '全部支出', value: 'all' }, { label: '日常消费', value: 'daily' }]}
          value={expenseScope}
          onChange={(value) => onExpenseScopeChange(value as TransactionScope)}
        />
      </Group>
    </>}>
      <Group justify="space-between" align="flex-end">
        <Box><Text size="xs" fw={600} c="dimmed">搜索结果</Text><Title order={2} size="h4">账目明细</Title></Box>
        <Text size="xs" c="dimmed">找到 {results.length} 笔</Text>
      </Group>
      {groups.length === 0 ? <EmptyState>{query.trim() ? '没有找到匹配的账单' : '输入关键词开始搜索'}</EmptyState> : <TransactionGroups groups={groups} onOpen={onOpen} />}
    </PageLayout>
  )
}
