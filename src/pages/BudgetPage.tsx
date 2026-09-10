import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Group, NumberInput, Paper, Progress, Stack, Text, TextInput } from '@mantine/core'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget } from '../domain/budget'
import type { Transaction } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { deleteBudget, saveBudget } from '../lib/db'
import { formatMoney } from '../lib/money'
import { confirmAction, showMessage } from '../ui/feedback'

type BudgetPageProps = {
  transactions: Transaction[]
  budgets: MonthlyBudget[]
  onChanged: () => Promise<void>
  onOpenMonth: (month: string) => void
}

export function BudgetPage({ transactions, budgets, onChanged, onOpenMonth }: BudgetPageProps) {
  const [month, setMonth] = useState(currentMonth())
  const activeBudget = useMemo(() => budgets.find((budget) => budget.month === month), [budgets, month])
  const [amount, setAmount] = useState('')

  useEffect(() => {
    setAmount(activeBudget ? String(activeBudget.amount) : '')
  }, [activeBudget])

  const progress = activeBudget ? summarizeBudget(transactions, activeBudget) : null
  const barPercentage = progress ? Math.min(Math.max(progress.percentage, 0), 100) : 0

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showMessage('请输入大于 0 的预算金额')
      return
    }

    await saveBudget({ month, amount: Math.round(numericAmount * 100) / 100 })
    await onChanged()
    showMessage('预算已保存')
  }

  async function handleDelete() {
    if (!activeBudget) return
    const confirmed = await confirmAction({
      message: `确定清除 ${month.replace('-', '年')}月的预算吗？`,
      confirmLabel: '清除',
      cancelLabel: '取消',
      destructive: true,
    })
    if (!confirmed) return
    await deleteBudget(month)
    await onChanged()
    showMessage('预算已清除')
  }

  return (
    <Stack gap="md">

        <TextInput
          label="选择月份"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value || currentMonth())}
        />

        <Paper component="button" type="button" p="lg" w="100%" ta="left" c="inherit" onClick={() => onOpenMonth(month)} aria-label={`查看${month}月详细账单`}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <Box>
                <Text size="sm" c="dimmed">{activeBudget ? '本月预算' : '尚未设置预算'}</Text>
                <Text mt={4} fz={30} fw={700}>{activeBudget ? formatMoney(activeBudget.amount) : '—'}</Text>
              </Box>
              {progress && <Text fw={600} c={progress.remaining < 0 ? 'red.6' : 'teal.7'}>{progress.percentage.toFixed(0)}%</Text>}
            </Group>

            <Progress value={barPercentage} color={progress && progress.percentage > 100 ? 'red' : 'teal'} size="md" aria-label="预算使用进度" />

            <Group grow align="flex-start">
              <Box><Text size="sm" c="dimmed">日常消费</Text><Text mt={4} fz="lg" fw={700}>{formatMoney(progress?.spent ?? 0)}</Text></Box>
              <Box><Text size="sm" c="dimmed">{progress && progress.remaining < 0 ? '已超出' : '剩余'}</Text><Text mt={4} fz="lg" fw={700} c={progress && progress.remaining < 0 ? 'red.6' : undefined}>{formatMoney(Math.abs(progress?.remaining ?? 0))}</Text></Box>
            </Group>
            <Text ta="right" size="xs" fw={700} c="teal.7">查看本月详细账单 →</Text>
          </Stack>
        </Paper>

        <Paper component="form" p="lg" onSubmit={handleSave}>
          <Stack gap="md">
            <NumberInput
              label="预算金额"
              min={1}
              step={1}
              placeholder="请输入本月预算"
              value={amount}
              onChange={(value) => setAmount(String(value))}
            />
            <Button type="submit">{activeBudget ? '更新预算' : '设置预算'}</Button>
            {activeBudget && <Button color="red" variant="subtle" type="button" onClick={handleDelete}>清除本月预算</Button>}
          </Stack>
        </Paper>
    </Stack>
  )
}
