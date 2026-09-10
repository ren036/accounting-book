import { useMemo, useState } from 'react'
import { ActionIcon, Badge, Box, Button, Drawer, Group, Paper, Progress, SegmentedControl, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core'
import { CheckCircle2, Landmark, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import {
  calibrateOpeningDisposableBalance,
  getBucketBalance,
  getGoalProgress,
  getSuggestedMonthlyDeposit,
  getTotalSavings,
  summarizeDisposable,
  summarizeSavingsMonths,
  type SavingsBucket,
  type SavingsBucketStatus,
  type SavingsMovement,
  type SavingsMovementType
} from '../domain/savings'
import type { Transaction } from '../domain/transaction'
import { combineDateWithTime, currentMonth, currentYear, todayInputValue } from '../lib/dates'
import { deleteSavingsMovement, saveSavingsBucket, saveSavingsMovement } from '../lib/db'
import { formatMoney } from '../lib/money'
import { confirmAction, showMessage } from '../ui/feedback'
import { EmptyState } from '../ui/display'

type SavingsPageProps = {
  transactions: Transaction[]
  buckets: SavingsBucket[]
  movements: SavingsMovement[]
  openingDisposableBalance: number
  amountsHidden: boolean
  onChanged: () => Promise<void>
  onOpeningBalanceChange: (value: number) => Promise<void>
}

type MovementEditor = {
  bucket: SavingsBucket
  movement: SavingsMovement | null
  type: SavingsMovementType
}

export function SavingsPage({ transactions, buckets, movements, openingDisposableBalance, amountsHidden, onChanged, onOpeningBalanceChange }: SavingsPageProps) {
  const [goalEditorOpen, setGoalEditorOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsBucket | null>(null)
  const [openingEditorOpen, setOpeningEditorOpen] = useState(false)
  const [movementEditor, setMovementEditor] = useState<MovementEditor | null>(null)
  const [goalName, setGoalName] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [goalStatus, setGoalStatus] = useState<SavingsBucketStatus>('active')
  const [openingAmount, setOpeningAmount] = useState(String(openingDisposableBalance))
  const [movementAmount, setMovementAmount] = useState('')
  const [movementDate, setMovementDate] = useState(todayInputValue())
  const [movementNote, setMovementNote] = useState('')

  const disposable = useMemo(
    () => summarizeDisposable(transactions, movements, openingDisposableBalance),
    [transactions, movements, openingDisposableBalance]
  )
  const totalSavings = getTotalSavings(movements, buckets)
  const generalBucket = buckets.find(({ kind }) => kind === 'general')
  const goals = buckets.filter(({ kind }) => kind === 'goal')
  const bucketNames = new Map(buckets.map((bucket) => [bucket.id, bucket.name]))
  const sortedMovements = [...movements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  const monthlyTrend = summarizeSavingsMonths(movements, currentYear(), currentMonth())

  function openMovementEditor(bucket: SavingsBucket, type: SavingsMovementType, movement: SavingsMovement | null = null) {
    setMovementEditor({ bucket, type: movement?.type ?? type, movement })
    setMovementAmount(movement ? String(movement.amount) : '')
    setMovementDate(movement?.occurredAt.slice(0, 10) ?? todayInputValue())
    setMovementNote(movement?.note ?? '')
  }

  function openCreateGoal() {
    setEditingGoal(null)
    setGoalName('')
    setGoalAmount('')
    setGoalDate('')
    setGoalStatus('active')
    setGoalEditorOpen(true)
  }

  function openEditGoal(goal: SavingsBucket) {
    setEditingGoal(goal)
    setGoalName(goal.name)
    setGoalAmount(String(goal.targetAmount ?? ''))
    setGoalDate(goal.targetDate ?? '')
    setGoalStatus(goal.status)
    setGoalEditorOpen(true)
  }

  async function handleSaveGoal(event: React.FormEvent) {
    event.preventDefault()
    const name = goalName.trim()
    const targetAmount = roundAmount(Number(goalAmount))
    if (!name) return showMessage('请输入专项资金名称')
    if (targetAmount === null) return showMessage('请输入大于 0 的目标金额')

    const status = editingGoal ? goalStatus : 'active'
    const balance = editingGoal ? getBucketBalance(movements, editingGoal.id) : 0
    if (editingGoal?.status === 'active' && status === 'used') {
      const confirmed = await confirmAction({
        message: `标记为已使用后，${formatMoney(balance)} 将从储蓄总额移除，不生成账单，也不会退回可支配。确定继续吗？`,
        confirmLabel: '确认使用',
        cancelLabel: '取消',
      })
      if (!confirmed) return
    }
    if (editingGoal?.status === 'active' && status === 'cancelled') {
      const confirmed = await confirmAction({
        message: balance > 0
          ? `取消后，剩余 ${formatMoney(balance)} 将自动退回当前可支配。确定继续吗？`
          : '确定取消这个专项资金吗？',
        confirmLabel: '确认取消',
        cancelLabel: '返回',
        destructive: true,
      })
      if (!confirmed) return
    }

    const bucket: SavingsBucket = {
      id: editingGoal?.id ?? crypto.randomUUID(),
      kind: 'goal',
      name,
      targetAmount,
      targetDate: goalDate || null,
      createdAt: editingGoal?.createdAt ?? new Date().toISOString(),
      status
    }
    const refundMovement: SavingsMovement | undefined = editingGoal?.status === 'active' && status === 'cancelled' && balance > 0
      ? {
          id: crypto.randomUUID(),
          bucketId: bucket.id,
          type: 'withdrawal',
          amount: balance,
          occurredAt: combineDateWithTime(todayInputValue()),
          note: '取消专项自动退回'
        }
      : undefined
    await saveSavingsBucket(bucket, refundMovement)
    await onChanged()
    setGoalName('')
    setGoalAmount('')
    setGoalDate('')
    setGoalStatus('active')
    setEditingGoal(null)
    setGoalEditorOpen(false)
    showMessage(editingGoal ? '专项资金已更新' : '专项资金已创建')
  }

  async function handleSaveOpening(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(openingAmount)
    if (!Number.isFinite(value)) return showMessage('请输入正确的当前金额')
    const calibratedOpeningBalance = calibrateOpeningDisposableBalance(transactions, movements, Math.round(value * 100) / 100)
    await onOpeningBalanceChange(calibratedOpeningBalance)
    setOpeningEditorOpen(false)
    showMessage('当前可支配金额已校准')
  }

  async function handleSaveMovement(event: React.FormEvent) {
    event.preventDefault()
    if (!movementEditor) return
    const amount = roundAmount(Number(movementAmount))
    if (amount === null) return showMessage('请输入大于 0 的金额')

    const existingBalance = getBucketBalance(
      movementEditor.movement ? movements.filter(({ id }) => id !== movementEditor.movement?.id) : movements,
      movementEditor.bucket.id
    )
    if (movementEditor.type === 'withdrawal' && amount > existingBalance) {
      return showMessage(`最多可取出 ${formatMoney(existingBalance)}`)
    }
    if (movementEditor.type === 'deposit' && movementEditor.bucket.targetAmount) {
      const remaining = Math.max(movementEditor.bucket.targetAmount - existingBalance, 0)
      if (amount > remaining) return showMessage(`距离目标还需 ${formatMoney(remaining)}`)
    }

    await saveSavingsMovement({
      id: movementEditor.movement?.id ?? crypto.randomUUID(),
      bucketId: movementEditor.bucket.id,
      type: movementEditor.type,
      amount,
      occurredAt: combineDateWithTime(movementDate, movementEditor.movement?.occurredAt),
      note: movementNote.trim()
    })
    await onChanged()
    setMovementEditor(null)
    showMessage(movementEditor.movement ? '储蓄记录已更新' : '储蓄记录已保存')
  }

  async function handleDeleteMovement(movement: SavingsMovement) {
    const confirmed = await confirmAction({ message: '确定删除这条储蓄记录吗？', confirmLabel: '删除', cancelLabel: '取消', destructive: true })
    if (!confirmed) return
    await deleteSavingsMovement(movement.id)
    await onChanged()
    showMessage('储蓄记录已删除')
  }

  return (
    <Stack gap="md" pb="md">
      <SimpleGrid cols={2} spacing="md">
        <Paper component="button" type="button" p="lg" w="100%" ta="left" c="inherit" onClick={() => {
            setOpeningAmount(String(disposable.balance))
            setOpeningEditorOpen(true)
          }}>
          <Text size="sm" c="dimmed">当前可支配</Text>
          <Text mt="xs" fz="xl" fw={700} c={disposable.balance < 0 ? 'red.6' : 'teal.7'}>{privateMoney(disposable.balance, amountsHidden)}</Text>
          <Text mt="xs" size="xs" c="dimmed">包含历月结转 · 点击校准金额</Text>
        </Paper>
        <Paper p="lg">
          <Text size="sm" c="dimmed">储蓄总额</Text>
          <Text mt="xs" fz="xl" fw={700}>{privateMoney(totalSavings, amountsHidden)}</Text>
          <Text mt="xs" size="xs" c="dimmed">通用储蓄与未结束专项</Text>
        </Paper>
      </SimpleGrid>

      {generalBucket && (
        <BucketCard
          bucket={generalBucket}
          balance={getBucketBalance(movements, generalBucket.id)}
          onDeposit={() => openMovementEditor(generalBucket, 'deposit')}
          onWithdraw={() => openMovementEditor(generalBucket, 'withdrawal')}
          amountsHidden={amountsHidden}
        />
      )}

      <Group justify="space-between" px={4}>
        <Group gap="xs"><Text fw={700}>专项资金</Text><Text size="xs" c="dimmed">{goals.length} 项</Text></Group>
        <ActionIcon color="teal" variant="subtle" aria-label="创建专项资金" onClick={openCreateGoal}><Plus size={16} strokeWidth={3} /></ActionIcon>
      </Group>

      {goals.length === 0 ? (
        <Paper component="button" type="button" p="lg" w="100%" ta="center" c="dimmed" withBorder style={{ borderStyle: 'dashed' }} onClick={openCreateGoal}>
          创建一个目标，分多次慢慢存够
        </Paper>
      ) : goals.map((goal) => (
        <BucketCard
          key={goal.id}
          bucket={goal}
          balance={getBucketBalance(movements, goal.id)}
          onDeposit={() => openMovementEditor(goal, 'deposit')}
          onWithdraw={() => openMovementEditor(goal, 'withdrawal')}
          onEdit={() => openEditGoal(goal)}
          amountsHidden={amountsHidden}
        />
      ))}

      <SavingsTrend movements={monthlyTrend} amountsHidden={amountsHidden} />

      <Text mt={4} px={4} fw={700}>储蓄记录</Text>
      {sortedMovements.length === 0 ? (
        <EmptyState>还没有存入或取出记录</EmptyState>
      ) : (
        <Stack gap="xs">
          {sortedMovements.map((movement) => {
            const bucket = buckets.find(({ id }) => id === movement.bucketId)
            if (!bucket) return null
            return (
              <Paper component="article" key={movement.id} p="md" radius="lg" withBorder>
                <Group justify="space-between" gap="md" wrap="nowrap">
                <Box miw={0}>
                  <Text fw={700}>{bucketNames.get(movement.bucketId) ?? '已删除专项'}</Text>
                  <Text mt={4} size="xs" c="dimmed" truncate>{movement.occurredAt.slice(0, 10)}{movement.note ? ` · ${movement.note}` : ''}</Text>
                </Box>
                <Group gap={4} wrap="nowrap">
                  <Text fw={700} c={movement.type === 'deposit' ? 'teal.7' : 'red.6'}>{amountsHidden ? '******' : `${movement.type === 'deposit' ? '+' : '-'}${formatMoney(movement.amount)}`}</Text>
                  {(bucket.kind === 'general' || bucket.status === 'active') && <>
                    <ActionIcon variant="subtle" color="gray" aria-label="编辑储蓄记录" onClick={() => openMovementEditor(bucket, movement.type, movement)}><Pencil size={16} /></ActionIcon>
                    <ActionIcon variant="subtle" color="red" aria-label="删除储蓄记录" onClick={() => void handleDeleteMovement(movement)}><Trash2 size={16} /></ActionIcon>
                  </>}
                </Group>
                </Group>
              </Paper>
            )
          })}
        </Stack>
      )}

      <Drawer opened={goalEditorOpen} onClose={() => setGoalEditorOpen(false)} title={editingGoal ? '编辑专项资金' : '创建专项资金'}>
        <Stack component="form" gap="md" pb="env(safe-area-inset-bottom)" onSubmit={handleSaveGoal}>
          <TextInput label="想为什么事情存钱" value={goalName} maxLength={30} placeholder="例如：买电脑" onChange={(event) => setGoalName(event.target.value)} />
          <TextInput label="目标金额" type="number" inputMode="decimal" min="0.01" step="0.01" value={goalAmount} placeholder="请输入目标金额" onChange={(event) => setGoalAmount(event.target.value)} />
          <TextInput label="目标日期（选填）" type="date" value={goalDate} onChange={(event) => setGoalDate(event.target.value)} />
          {editingGoal?.status === 'active' && <SegmentedControl fullWidth value={goalStatus} data={[{ value: 'active', label: '存钱中' }, { value: 'used', label: '已使用' }, { value: 'cancelled', label: '已取消' }]} onChange={(value) => setGoalStatus(value as SavingsBucketStatus)} />}
          {editingGoal && editingGoal.status !== 'active' && <Box p="sm" bg="var(--book-surface-muted)" style={{ borderRadius: 14 }}><Text size="sm" fw={700}>状态：{editingGoal.status === 'used' ? '已使用' : '已取消'}</Text><Text size="xs" c="dimmed">已结束的专项不能再次存取或修改状态</Text></Box>}
          <Button type="submit">{editingGoal ? '保存修改' : '创建'}</Button>
        </Stack>
      </Drawer>

      <Drawer opened={openingEditorOpen} onClose={() => setOpeningEditorOpen(false)} title="校准当前可支配金额">
        <Stack component="form" gap="md" pb="env(safe-area-inset-bottom)" onSubmit={handleSaveOpening}>
          <Text size="sm" c="dimmed">直接填写你现在实际可以自由支配的钱。系统会自动抵消历史账单的影响，之后继续随收支和储蓄变化。</Text>
          <TextInput label="当前实际金额" type="number" inputMode="decimal" step="0.01" value={openingAmount} onChange={(event) => setOpeningAmount(event.target.value)} />
          <Button type="submit">确认校准</Button>
        </Stack>
      </Drawer>

      <Drawer opened={movementEditor !== null} onClose={() => setMovementEditor(null)} title={movementEditor?.movement ? '编辑记录' : movementEditor?.type === 'deposit' ? `存入「${movementEditor?.bucket.name}」` : `从「${movementEditor?.bucket.name}」取出`}>
        {movementEditor && (
          <Stack component="form" gap="md" pb="env(safe-area-inset-bottom)" onSubmit={handleSaveMovement}>
            <SegmentedControl fullWidth data={[{ label: '存入', value: 'deposit' }, { label: '取出', value: 'withdrawal' }]}
              value={movementEditor.type}
              onChange={(value) => setMovementEditor({ ...movementEditor, type: value as SavingsMovementType })}
            />
            <TextInput label="金额" autoFocus type="number" inputMode="decimal" min="0.01" step="0.01" value={movementAmount} onChange={(event) => setMovementAmount(event.target.value)} />
            <TextInput label="日期" type="date" max={todayInputValue()} value={movementDate} onChange={(event) => setMovementDate(event.target.value)} />
            <TextInput label="备注（选填）" value={movementNote} maxLength={100} onChange={(event) => setMovementNote(event.target.value)} />
            <Button type="submit">保存</Button>
          </Stack>
        )}
      </Drawer>

    </Stack>
  )
}

function BucketCard({ bucket, balance, onDeposit, onWithdraw, onEdit, amountsHidden }: { bucket: SavingsBucket; balance: number; onDeposit: () => void; onWithdraw: () => void; onEdit?: () => void; amountsHidden: boolean }) {
  const progress = getGoalProgress(bucket, balance)
  const targetReached = bucket.targetAmount !== null && balance >= bucket.targetAmount
  const isClosed = bucket.kind === 'goal' && bucket.status !== 'active'
  const depositDisabled = isClosed || (bucket.kind === 'goal' && targetReached)
  const depositLabel = bucket.status === 'used' ? '已使用' : bucket.status === 'cancelled' ? '已取消' : targetReached ? '已存够' : '存入'
  const statusLabel = bucket.status === 'used' ? '已使用' : bucket.status === 'cancelled' ? '已取消' : targetReached ? '已存够' : '存钱中'
  const statusColor = bucket.status === 'used' ? 'yellow' : bucket.status === 'cancelled' ? 'gray' : targetReached ? 'teal' : 'blue'
  return (
    <Paper component="article" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
          <Group gap="xs" wrap="nowrap"><ThemeIcon color="teal" variant="light" radius="xl" size="lg">{bucket.kind === 'general' ? <Landmark size={20} /> : <Target size={20} />}</ThemeIcon><Box><Text fw={700}>{bucket.name}</Text>{bucket.targetDate && <Text size="xs" c="dimmed">目标日期 {bucket.targetDate}</Text>}</Box></Group>
          {bucket.kind === 'goal' && <Group gap={4} wrap="nowrap"><Badge color={statusColor} variant="light" leftSection={<CheckCircle2 size={12} />}>{statusLabel}</Badge>{onEdit && <ActionIcon variant="light" color="gray" aria-label={`编辑${bucket.name}`} onClick={onEdit}><Pencil size={15} /></ActionIcon>}</Group>}
        </Group>
        <Text fz="xl" fw={700}>{privateMoney(balance, amountsHidden)}{bucket.targetAmount && <Text component="span" size="sm" c="dimmed"> / {privateMoney(bucket.targetAmount, amountsHidden)}</Text>}</Text>
        {bucket.targetAmount && <Progress value={Math.min(progress, 100)} size="sm" />}
        {bucket.targetAmount && !targetReached && bucket.status === 'active' && <Text size="xs" c="dimmed">还需 {privateMoney(Math.max(bucket.targetAmount - balance, 0), amountsHidden)} · 已完成 {progress.toFixed(0)}%</Text>}
        {bucket.status === 'used' && <Text size="xs" c="dimmed">该金额已使用，并已从储蓄总额移除</Text>}
        {bucket.status === 'cancelled' && <Text size="xs" c="dimmed">专项已取消，剩余金额已退回可支配</Text>}
        {getSuggestedMonthlyDeposit(bucket, balance) !== null && !targetReached && <Box p="sm" bg="var(--mantine-color-teal-light)" c="var(--mantine-color-teal-light-color)" style={{ borderRadius: 14 }}><Text size="xs">按目标日期，建议每月存 {privateMoney(getSuggestedMonthlyDeposit(bucket, balance) ?? 0, amountsHidden)}</Text></Box>}
        <SimpleGrid cols={2} spacing="xs"><Button disabled={depositDisabled} onClick={onDeposit}>{depositLabel}</Button><Button variant="light" color="gray" disabled={isClosed || balance <= 0} onClick={onWithdraw}>取出</Button></SimpleGrid>
      </Stack>
    </Paper>
  )
}

function SavingsTrend({ movements, amountsHidden }: { movements: ReturnType<typeof summarizeSavingsMonths>; amountsHidden: boolean }) {
  const visible = movements.slice(-6)
  const maximum = Math.max(...visible.map((item) => Math.max(item.deposits, item.withdrawals)), 1)
  return (
    <Paper component="section" p="lg">
      <Stack gap="md">
      <Box><Text size="xs" fw={700} tt="uppercase" c="teal.7">储蓄趋势</Text><Title order={3} size="h5" mt={4}>近 6 个月存取</Title></Box>
      <SimpleGrid cols={6} spacing="xs" h={144} style={{ alignItems: 'end' }}>
        {visible.map((item) => (
          <Stack key={item.month} h="100%" gap="xs" align="center">
            <Group flex={1} align="flex-end" gap={4} wrap="nowrap">
              <Box w={8} bg="teal.6" title={`存入 ${privateMoney(item.deposits, amountsHidden)}`} style={{ borderRadius: '4px 4px 0 0', height: `${Math.max(item.deposits / maximum * 100, item.deposits ? 5 : 0)}%` }} />
              <Box w={8} bg="red.5" title={`取出 ${privateMoney(item.withdrawals, amountsHidden)}`} style={{ borderRadius: '4px 4px 0 0', height: `${Math.max(item.withdrawals / maximum * 100, item.withdrawals ? 5 : 0)}%` }} />
            </Group>
            <Text size="xs" c="dimmed">{Number(item.month.slice(5))}月</Text>
          </Stack>
        ))}
      </SimpleGrid>
      <Group justify="center" gap="lg"><Text size="xs" c="teal.7">● 存入</Text><Text size="xs" c="red.6">● 取出</Text></Group>
      </Stack>
    </Paper>
  )
}

function privateMoney(amount: number, hidden: boolean): string {
  return hidden ? '******' : formatMoney(amount)
}

function roundAmount(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.round(value * 100) / 100
}
