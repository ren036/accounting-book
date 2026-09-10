import { useRef, useState } from 'react'
import { Box, Button, Group, Paper, Progress, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { CollapsibleTransactionSearch } from '../components/CollapsibleTransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget, summarizeDailyExpense } from '../domain/budget'
import { searchTransactions } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { ArrowRight, ImagePlus, PiggyBank } from 'lucide-react'
import { showMessage } from '../ui/feedback'
type DashboardPageProps = {
  transactions: Transaction[]
  budgets: MonthlyBudget[]
  balanceCardBackground: string | null
  disposableBalance: number
  totalSavings: number
  savingsAmountsHidden: boolean
  onOpen: (id: string) => void
  onOpenBudget: () => void
  onOpenSavings: () => void
  onSavingsAmountsHiddenChange: (value: boolean) => Promise<void>
  onBalanceCardBackgroundChange: (value: string | null) => Promise<void>
}

export function DashboardPage({ transactions, budgets, balanceCardBackground, disposableBalance, totalSavings, savingsAmountsHidden, onOpen, onOpenBudget, onOpenSavings, onSavingsAmountsHiddenChange, onBalanceCardBackgroundChange }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const backgroundInputRef = useRef<HTMLInputElement | null>(null)
  const month = currentMonth()
  const summary = summarizeMonth(transactions, month)
  const budget = budgets.find((item) => item.month === month)
  const budgetProgress = budget ? summarizeBudget(transactions, budget) : null
  const dailyExpense = summarizeDailyExpense(transactions, month)
  const groups = groupMonthTransactionsByDay(searchTransactions(transactions, searchQuery), month)
  const hasSearchQuery = searchQuery.trim().length > 0
  const budgetBarPercentage = budgetProgress ? Math.min(Math.max(budgetProgress.percentage, 0), 100) : 0
  const budgetExceeded = Boolean(budgetProgress && budgetProgress.percentage > 100)

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

  return (
    <Stack component="section" h="100%" mih={0} gap="sm">
      <Stack gap="sm" style={{ flexShrink: 0 }}>
        <Paper
          pos="relative"
          mih="calc(142px + env(safe-area-inset-top))"
          px="lg"
          pt="calc(var(--mantine-spacing-md) + env(safe-area-inset-top))"
          pb="md"
          radius={0}
          c="white"
          shadow="md"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // borderRadius: '0 0 24px 24px',
            backgroundImage: balanceCardBackground
              ? `linear-gradient(135deg, rgb(7 75 62 / 20%), rgb(10 42 36 / 18%)), url(${JSON.stringify(balanceCardBackground)})`
              : 'radial-gradient(circle at 20% 0%, #4f46e5 0, transparent 34%), linear-gradient(#111827, #111827)',
          }}
        >
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm" c="rgba(255,255,255,.82)" fw={500}>当前可支配</Text>
            <Button
              size="compact-xs"
              radius="xl"
              color="gray"
              variant="white"
              leftSection={<ImagePlus size={13} />}
              onClick={handleBackgroundButton}
            >
              更换背景
            </Button>
          </Group>
          <Text mt={4} fz="clamp(30px, 10vw, 38px)" fw={750} lh={1.15} style={{ letterSpacing: '-0.035em' }}>{privateMoney(disposableBalance, savingsAmountsHidden)}</Text>
          <Box component="input" ref={backgroundInputRef} display="none" type="file" accept="image/*" onChange={handleBackgroundFile} />
          <Group mt="auto" gap="lg" pt="md" wrap="nowrap">
            <Text size="xs" c="rgba(255,255,255,.84)">月收入 <Text component="span" c="white" fw={650}>{formatMoney(summary.income)}</Text></Text>
            <Text size="xs" c="rgba(255,255,255,.84)">月支出 <Text component="span" c="white" fw={650}>{formatMoney(summary.expense)}</Text></Text>
          </Group>
        </Paper>
        <Stack gap="sm" px="md">
        <Paper component="button" type="button" p="md" radius="xl" shadow="xs" w="100%" ta="left" c="inherit" onClick={onOpenBudget}>
          <Stack gap="xs">
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" miw={0}>
              <ThemeIcon color="teal" variant="light" radius="md" size={34}><PiggyBank size={17} /></ThemeIcon>
              <Box>
                <Text size="sm" fw={700} lh={1.25}>本月预算</Text>
                <Text size="xs" c="dimmed">{budget ? `已用 ${formatMoney(budgetProgress?.spent ?? 0)} / ${formatMoney(budget.amount)}` : '还没有设置预算'}</Text>
              </Box>
            </Group>
            <Group gap={3} wrap="nowrap" c={budgetExceeded ? 'red.6' : 'teal.7'}><Text size="sm" fw={650}>{budgetProgress ? `${budgetProgress.percentage.toFixed(0)}%` : '去设置'}</Text><ArrowRight size={15} /></Group>
          </Group>
          {budgetProgress && (
            <>
              <Progress value={budgetBarPercentage} color={budgetExceeded ? 'red' : 'teal'} size={4} radius="xl" />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">{budgetProgress.remaining >= 0 ? '剩余' : '超出'} <Text component="span" fw={700} c={budgetExceeded ? 'red.6' : 'dark'}>{formatMoney(Math.abs(budgetProgress.remaining))}</Text></Text>
                <Text size="xs" c="dimmed">{month.replace('-', '年')}月</Text>
              </Group>
            </>
          )}
          {!budgetProgress && (
            <Group justify="space-between" bg="teal.0" px="sm" py={7} style={{ borderRadius: 12 }}><Text size="xs" c="teal.8">控制支出，从设定目标开始</Text><Text size="xs" fw={700} c="teal.8">立即设置</Text></Group>
          )}
          </Stack>
        </Paper>
        <CollapsibleTransactionSearch value={searchQuery} onChange={setSearchQuery}>
          <Title order={3} size="h5">当月账单详情</Title>
        </CollapsibleTransactionSearch>
        </Stack>
      </Stack>

      <Box component="section" mih={0} flex={1} px="md" pb="md" style={{ overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {groups.length === 0 ? (
          <Paper p="xl" radius="xl"><Text ta="center" c="dimmed">{hasSearchQuery ? '没有找到匹配的账单' : '这个月还没有账单'}</Text></Paper>
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
      </Box>
    </Stack>
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
