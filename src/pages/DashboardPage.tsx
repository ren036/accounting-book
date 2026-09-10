import { useRef, useState } from 'react'
import { Box, Button, Group, Menu, Paper, Progress, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { CollapsibleTransactionSearch } from '../components/CollapsibleTransactionSearch'
import { TransactionGroups } from '../components/TransactionGroups'
import { groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget, summarizeDailyExpense } from '../domain/budget'
import { searchTransactions } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { ArrowRight, ChevronDown, ImagePlus, RotateCcw } from 'lucide-react'
import { showMessage } from '../ui/feedback'
import { EmptyState } from '../ui/display'
import { PageLayout } from '../ui/layout'
type DashboardPageProps = {
  transactions: Transaction[]
  budgets: MonthlyBudget[]
  balanceCardBackground: string | null
  disposableBalance: number
  totalSavings: number
  savingsAmountsHidden: boolean
  onOpen: (id: string) => void
  onCreate: () => void
  onOpenBudget: () => void
  onOpenSavings: () => void
  onSavingsAmountsHiddenChange: (value: boolean) => Promise<void>
  onBalanceCardBackgroundChange: (value: string | null) => Promise<void>
}

export function DashboardPage({ transactions, budgets, balanceCardBackground, disposableBalance, totalSavings, savingsAmountsHidden, onOpen, onCreate, onOpenBudget, onOpenSavings, onSavingsAmountsHiddenChange, onBalanceCardBackgroundChange }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const backgroundInputRef = useRef<HTMLInputElement | null>(null)
  const month = currentMonth()
  const summary = summarizeMonth(transactions, month)
  const budget = budgets.find((item) => item.month === month)
  const budgetProgress = budget ? summarizeBudget(transactions, budget) : null
  const groups = groupMonthTransactionsByDay(searchTransactions(transactions, searchQuery), month)
  const hasSearchQuery = searchQuery.trim().length > 0
  const budgetBarPercentage = budgetProgress ? Math.min(Math.max(budgetProgress.percentage, 0), 100) : 0
  const budgetExceeded = Boolean(budgetProgress && budgetProgress.percentage > 100)
  const transactionCount = transactions.filter((transaction) => transaction.occurredAt.startsWith(month)).length

  async function handleBackgroundFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showMessage('请选择图片文件')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      showMessage('图片不能超过 8MB')
      return
    }

    await onBalanceCardBackgroundChange(await readFileAsDataUrl(file))
    showMessage('背景已更新')
  }

  function handleBackgroundButton() {
    backgroundInputRef.current?.click()
  }

  async function handleResetBackground() {
    await onBalanceCardBackgroundChange(null)
    showMessage('已恢复默认背景')
  }

  return (
    <PageLayout gap="xs" headerGap="xs" contentGap="xs" header={<>
        <Paper
          className="ledger-surface"
          pos="relative"
          mih={152}
          px="lg"
          py="md"
          c={balanceCardBackground ? 'white' : 'inherit'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundImage: balanceCardBackground
              ? `linear-gradient(rgb(25 24 20 / 44%), rgb(25 24 20 / 44%)), url(${JSON.stringify(balanceCardBackground)})`
              : undefined,
            backgroundColor: balanceCardBackground ? undefined : 'var(--book-surface)',
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm" c={balanceCardBackground ? 'rgba(255,255,255,.85)' : 'dimmed'} fw={500}>可支配余额</Text>
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <Button size="compact-xs" color={balanceCardBackground ? 'gray' : 'dark'} variant={balanceCardBackground ? 'white' : 'subtle'} rightSection={<ChevronDown size={12} />}>
                  封面
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<ImagePlus size={15} />} onClick={handleBackgroundButton}>
                  更换背景
                </Menu.Item>
                <Menu.Item leftSection={<RotateCcw size={15} />} disabled={!balanceCardBackground} onClick={() => void handleResetBackground()}>
                  恢复默认
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Text mt={4} fz="clamp(30px, 10vw, 38px)" fw={750} lh={1.15} style={{ letterSpacing: '-0.035em' }}>{privateMoney(disposableBalance, savingsAmountsHidden)}</Text>
          <Box component="input" ref={backgroundInputRef} display="none" type="file" accept="image/*" onChange={handleBackgroundFile} />
          <Group mt="auto" gap="xl" pt="md" wrap="nowrap" style={{ borderTop: `1px solid ${balanceCardBackground ? 'rgba(255,255,255,.3)' : 'var(--book-border)'}` }}>
            <Text size="xs" c={balanceCardBackground ? 'rgba(255,255,255,.84)' : 'dimmed'}>收入 <Text component="span" c={balanceCardBackground ? 'white' : 'teal.8'} fw={650}>{formatMoney(summary.income)}</Text></Text>
            <Text size="xs" c={balanceCardBackground ? 'rgba(255,255,255,.84)' : 'dimmed'}>支出 <Text component="span" c={balanceCardBackground ? 'white' : 'red.7'} fw={650}>{formatMoney(summary.expense)}</Text></Text>
            <UnstyledButton ml="auto" c="inherit" onClick={onOpenSavings}>
              <Text size="xs" c={balanceCardBackground ? 'rgba(255,255,255,.84)' : 'dimmed'}>储蓄 <Text component="span" c={balanceCardBackground ? 'white' : 'inherit'} fw={650}>{privateMoney(totalSavings, savingsAmountsHidden)}</Text></Text>
            </UnstyledButton>
          </Group>
        </Paper>
        <Box component="button" type="button" className="ledger-panel" p="md" w="100%" ta="left" c="inherit" onClick={onOpenBudget}>
          <Stack gap="xs">
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Box>
              <Text size="sm" fw={700} lh={1.25}>本月预算</Text>
              <Text size="xs" c="dimmed">{budget ? `已用 ${formatMoney(budgetProgress?.spent ?? 0)} / ${formatMoney(budget.amount)}` : '还没设置预算'}</Text>
            </Box>
            <Group gap={3} wrap="nowrap" c={budgetExceeded ? 'red.6' : 'teal.7'}><Text size="sm" fw={650}>{budgetProgress ? `${budgetProgress.percentage.toFixed(0)}%` : '去设置'}</Text><ArrowRight size={15} /></Group>
          </Group>
          {budgetProgress && (
            <>
              <Progress value={budgetBarPercentage} color={budgetExceeded ? 'red' : 'teal'} size={4} />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{budgetProgress.remaining >= 0 ? '剩余' : '超出'} <Text component="span" fw={700} c={budgetExceeded ? 'red.6' : 'dark'}>{formatMoney(Math.abs(budgetProgress.remaining))}</Text></Text>
                <Text size="xs" c="dimmed">{month.replace('-', '年')}月</Text>
              </Group>
            </>
          )}
          {!budgetProgress && (
            <Text size="xs" c="dimmed">设一个数，月底更容易看清花了多少。</Text>
          )}
          </Stack>
        </Box>
      </>}>
        <CollapsibleTransactionSearch value={searchQuery} onChange={setSearchQuery}>
          <Group gap="xs" align="baseline" px='xs'>
            <Title order={3} size="h5">{`${Number(month.slice(5))}月流水`}</Title>
            <Text size="xs" c="dimmed">{hasSearchQuery ? `${groups.reduce((count, group) => count + group.transactions.length, 0)} 条结果` : `${transactionCount} 笔`}</Text>
          </Group>
        </CollapsibleTransactionSearch>
        {groups.length === 0 ? (
          hasSearchQuery ? (
            <EmptyState>没有找到匹配的账单</EmptyState>
          ) : (
            <Group py="lg" justify="space-between" gap="md" wrap="nowrap">
              <Box>
                <Text size="sm" fw={650}>本月暂无流水</Text>
                <Text mt={2} size="xs" c="dimmed">记下的收支会出现在这里</Text>
              </Box>
              <Button flex="0 0 auto" px={0} size="compact-sm" variant="transparent" rightSection={<ArrowRight size={14} />} onClick={onCreate}>记一笔</Button>
            </Group>
          )
        ) : (
          <TransactionGroups groups={groups} onOpen={onOpen} />
        )}
    </PageLayout>
  )
}

function privateMoney(amount: number, hidden: boolean): string {
  return hidden ? '******' : formatMoney(amount)
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}
