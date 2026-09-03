import { useMemo, useState } from 'react'
import { Button, Dialog, Popup, Segmented, Toast } from 'antd-mobile'
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
import { cardClass, fieldClass } from '../ui/classes'

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
    if (!name) return Toast.show({ content: '请输入专项资金名称' })
    if (targetAmount === null) return Toast.show({ content: '请输入大于 0 的目标金额' })

    const status = editingGoal ? goalStatus : 'active'
    const balance = editingGoal ? getBucketBalance(movements, editingGoal.id) : 0
    if (editingGoal?.status === 'active' && status === 'used') {
      const confirmed = await Dialog.confirm({
        content: `标记为已使用后，${formatMoney(balance)} 将从储蓄总额移除，不生成账单，也不会退回可支配。确定继续吗？`,
        confirmText: '确认使用',
        cancelText: '取消'
      })
      if (!confirmed) return
    }
    if (editingGoal?.status === 'active' && status === 'cancelled') {
      const confirmed = await Dialog.confirm({
        content: balance > 0
          ? `取消后，剩余 ${formatMoney(balance)} 将自动退回当前可支配。确定继续吗？`
          : '确定取消这个专项资金吗？',
        confirmText: '确认取消',
        cancelText: '返回'
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
    Toast.show({ content: editingGoal ? '专项资金已更新' : '专项资金已创建' })
  }

  async function handleSaveOpening(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(openingAmount)
    if (!Number.isFinite(value)) return Toast.show({ content: '请输入正确的当前金额' })
    const calibratedOpeningBalance = calibrateOpeningDisposableBalance(transactions, movements, Math.round(value * 100) / 100)
    await onOpeningBalanceChange(calibratedOpeningBalance)
    setOpeningEditorOpen(false)
    Toast.show({ content: '当前可支配金额已校准' })
  }

  async function handleSaveMovement(event: React.FormEvent) {
    event.preventDefault()
    if (!movementEditor) return
    const amount = roundAmount(Number(movementAmount))
    if (amount === null) return Toast.show({ content: '请输入大于 0 的金额' })

    const existingBalance = getBucketBalance(
      movementEditor.movement ? movements.filter(({ id }) => id !== movementEditor.movement?.id) : movements,
      movementEditor.bucket.id
    )
    if (movementEditor.type === 'withdrawal' && amount > existingBalance) {
      return Toast.show({ content: `最多可取出 ${formatMoney(existingBalance)}` })
    }
    if (movementEditor.type === 'deposit' && movementEditor.bucket.targetAmount) {
      const remaining = Math.max(movementEditor.bucket.targetAmount - existingBalance, 0)
      if (amount > remaining) return Toast.show({ content: `距离目标还需 ${formatMoney(remaining)}` })
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
    Toast.show({ content: movementEditor.movement ? '储蓄记录已更新' : '储蓄记录已保存' })
  }

  async function handleDeleteMovement(movement: SavingsMovement) {
    const confirmed = await Dialog.confirm({ content: '确定删除这条储蓄记录吗？', confirmText: '删除', cancelText: '取消' })
    if (!confirmed) return
    await deleteSavingsMovement(movement.id)
    await onChanged()
    Toast.show({ content: '储蓄记录已删除' })
  }

  return (
    <div className="grid gap-3 pb-3">
      <section className="grid grid-cols-2 gap-3">
        <button type="button" className={`${cardClass} text-left text-inherit`} onClick={() => {
          setOpeningAmount(String(disposable.balance))
          setOpeningEditorOpen(true)
        }}>
          <span className="text-sm text-[var(--book-muted)]">当前可支配</span>
          <strong className={`mt-2 block text-2xl ${disposable.balance < 0 ? 'text-[var(--book-expense)]' : 'text-[var(--book-green)]'}`}>{privateMoney(disposable.balance, amountsHidden)}</strong>
          <small className="mt-2 block text-[var(--book-muted)]">包含历月结转 · 点击校准金额</small>
        </button>
        <div className={cardClass}>
          <span className="text-sm text-[var(--book-muted)]">储蓄总额</span>
          <strong className="mt-2 block text-2xl">{privateMoney(totalSavings, amountsHidden)}</strong>
          <small className="mt-2 block text-[var(--book-muted)]">通用储蓄与未结束专项</small>
        </div>
      </section>

      {generalBucket && (
        <BucketCard
          bucket={generalBucket}
          balance={getBucketBalance(movements, generalBucket.id)}
          onDeposit={() => openMovementEditor(generalBucket, 'deposit')}
          onWithdraw={() => openMovementEditor(generalBucket, 'withdrawal')}
          amountsHidden={amountsHidden}
        />
      )}

      <div className="flex items-center justify-between px-1">
        <div><strong>专项资金</strong><span className="ml-2 text-xs text-[var(--book-muted)]">{goals.length} 项</span></div>
        <Button size="small" color="primary" fill="none" onClick={openCreateGoal}><Plus size={16} stroke-width={3} /></Button>
      </div>

      {goals.length === 0 ? (
        <button type="button" className={`${cardClass} border-dashed text-center text-[var(--book-muted)]`} onClick={openCreateGoal}>
          创建一个目标，分多次慢慢存够
        </button>
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

      <div className="mt-1 px-1"><strong>储蓄记录</strong></div>
      {sortedMovements.length === 0 ? (
        <p className={`${cardClass} m-0 text-center text-[var(--book-muted)]`}>还没有存入或取出记录</p>
      ) : (
        <div className="grid gap-2">
          {sortedMovements.map((movement) => {
            const bucket = buckets.find(({ id }) => id === movement.bucketId)
            if (!bucket) return null
            return (
              <article key={movement.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[var(--book-border)] bg-white p-3.5">
                <div className="min-w-0">
                  <strong>{bucketNames.get(movement.bucketId) ?? '已删除专项'}</strong>
                  <p className="m-0 mt-1 truncate text-xs text-[var(--book-muted)]">{movement.occurredAt.slice(0, 10)}{movement.note ? ` · ${movement.note}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <strong className={movement.type === 'deposit' ? 'text-[var(--book-green)]' : 'text-[var(--book-expense)]'}>{amountsHidden ? '******' : `${movement.type === 'deposit' ? '+' : '-'}${formatMoney(movement.amount)}`}</strong>
                  {(bucket.kind === 'general' || bucket.status === 'active') && <>
                    <button type="button" className="border-0 bg-transparent p-2 text-[var(--book-muted)]" aria-label="编辑储蓄记录" onClick={() => openMovementEditor(bucket, movement.type, movement)}><Pencil size={16} /></button>
                    <button type="button" className="border-0 bg-transparent p-2 text-[var(--book-expense)]" aria-label="删除储蓄记录" onClick={() => void handleDeleteMovement(movement)}><Trash2 size={16} /></button>
                  </>}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Popup visible={goalEditorOpen} onMaskClick={() => setGoalEditorOpen(false)} bodyStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <form className="grid gap-3 p-4 pb-[max(20px,env(safe-area-inset-bottom))]" onSubmit={handleSaveGoal}>
          <strong className="text-lg">{editingGoal ? '编辑专项资金' : '创建专项资金'}</strong>
          <label className={fieldClass}><span>想为什么事情存钱</span><input value={goalName} maxLength={30} placeholder="例如：买电脑" onChange={(event) => setGoalName(event.target.value)} /></label>
          <label className={fieldClass}><span>目标金额</span><input type="number" inputMode="decimal" min="0.01" step="0.01" value={goalAmount} placeholder="请输入目标金额" onChange={(event) => setGoalAmount(event.target.value)} /></label>
          <label className={fieldClass}><span>目标日期（选填）</span><input type="date" value={goalDate} onChange={(event) => setGoalDate(event.target.value)} /></label>
          {editingGoal?.status === 'active' && <label className={fieldClass}><span>状态</span><select className="w-full rounded-[var(--book-radius-control)] border border-[var(--book-border)] bg-white p-3 text-base" value={goalStatus} onChange={(event) => setGoalStatus(event.target.value as SavingsBucketStatus)}><option value="active">存钱中</option><option value="used">已使用</option><option value="cancelled">已取消</option></select><small className="text-[var(--book-muted)]">达到目标金额后会自动显示“已存够”</small></label>}
          {editingGoal && editingGoal.status !== 'active' && <div className={fieldClass}><span>状态</span><strong>{editingGoal.status === 'used' ? '已使用' : '已取消'}</strong><small className="text-[var(--book-muted)]">已结束的专项不能再次存取或修改状态</small></div>}
          <Button color="primary" shape="rounded" type="submit">{editingGoal ? '保存修改' : '创建'}</Button>
        </form>
      </Popup>

      <Popup visible={openingEditorOpen} onMaskClick={() => setOpeningEditorOpen(false)} bodyStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <form className="grid gap-3 p-4 pb-[max(20px,env(safe-area-inset-bottom))]" onSubmit={handleSaveOpening}>
          <strong className="text-lg">校准当前可支配金额</strong>
          <p className="m-0 text-sm text-[var(--book-muted)]">直接填写你现在实际可以自由支配的钱。系统会自动抵消历史账单的影响，之后继续随收支和储蓄变化。</p>
          <label className={fieldClass}><span>当前实际金额</span><input type="number" inputMode="decimal" step="0.01" value={openingAmount} onChange={(event) => setOpeningAmount(event.target.value)} /></label>
          <Button color="primary" shape="rounded" type="submit">确认校准</Button>
        </form>
      </Popup>

      <Popup visible={movementEditor !== null} onMaskClick={() => setMovementEditor(null)} bodyStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        {movementEditor && (
          <form className="grid gap-3 p-4 pb-[max(20px,env(safe-area-inset-bottom))]" onSubmit={handleSaveMovement}>
            <strong className="text-lg">{movementEditor.movement ? '编辑记录' : movementEditor.type === 'deposit' ? `存入「${movementEditor.bucket.name}」` : `从「${movementEditor.bucket.name}」取出`}</strong>
            <Segmented
              block
              options={[{ label: '存入', value: 'deposit' }, { label: '取出', value: 'withdrawal' }]}
              value={movementEditor.type}
              onChange={(value) => setMovementEditor({ ...movementEditor, type: value as SavingsMovementType })}
            />
            <label className={fieldClass}><span>金额</span><input autoFocus type="number" inputMode="decimal" min="0.01" step="0.01" value={movementAmount} onChange={(event) => setMovementAmount(event.target.value)} /></label>
            <label className={fieldClass}><span>日期</span><input type="date" max={todayInputValue()} value={movementDate} onChange={(event) => setMovementDate(event.target.value)} /></label>
            <label className={fieldClass}><span>备注（选填）</span><input value={movementNote} maxLength={100} onChange={(event) => setMovementNote(event.target.value)} /></label>
            <Button color="primary" shape="rounded" type="submit">保存</Button>
          </form>
        )}
      </Popup>

    </div>
  )
}

function BucketCard({ bucket, balance, onDeposit, onWithdraw, onEdit, amountsHidden }: { bucket: SavingsBucket; balance: number; onDeposit: () => void; onWithdraw: () => void; onEdit?: () => void; amountsHidden: boolean }) {
  const progress = getGoalProgress(bucket, balance)
  const targetReached = bucket.targetAmount !== null && balance >= bucket.targetAmount
  const isClosed = bucket.kind === 'goal' && bucket.status !== 'active'
  const depositDisabled = isClosed || (bucket.kind === 'goal' && targetReached)
  const depositLabel = bucket.status === 'used' ? '已使用' : bucket.status === 'cancelled' ? '已取消' : targetReached ? '已存够' : '存入'
  const statusLabel = bucket.status === 'used' ? '已使用' : bucket.status === 'cancelled' ? '已取消' : targetReached ? '已存够' : '存钱中'
  const statusClass = bucket.status === 'used'
    ? 'bg-amber-100 text-amber-700'
    : bucket.status === 'cancelled'
      ? 'bg-neutral-100 text-neutral-500'
      : targetReached
        ? 'bg-[var(--book-green-soft)] text-[var(--book-green)]'
        : 'bg-blue-50 text-blue-600'
  return (
    <article className={`${cardClass} grid gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--book-green-soft)] p-2 text-[var(--book-green)]">{bucket.kind === 'general' ? <Landmark size={20} /> : <Target size={20} />}</span>
          <div><strong className="block">{bucket.name}</strong>{bucket.targetDate && <small className="text-[var(--book-muted)]">目标日期 {bucket.targetDate}</small>}</div>
        </div>
        {bucket.kind === 'goal' && <div className="flex items-center gap-1"><span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusClass}`}><CheckCircle2 size={14} />{statusLabel}</span>{onEdit && <button type="button" className="rounded-full border-0 bg-neutral-100 p-2 text-[var(--book-muted)]" aria-label={`编辑${bucket.name}`} onClick={onEdit}><Pencil size={15} /></button>}</div>}
      </div>
      <div><strong className="text-2xl">{privateMoney(balance, amountsHidden)}</strong>{bucket.targetAmount && <span className="text-sm text-[var(--book-muted)]"> / {privateMoney(bucket.targetAmount, amountsHidden)}</span>}</div>
      {bucket.targetAmount && <div className="h-2.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[var(--book-green)] transition-[width]" style={{ width: `${Math.min(progress, 100)}%` }} /></div>}
      {bucket.targetAmount && !targetReached && bucket.status === 'active' && <small className="text-[var(--book-muted)]">还需 {privateMoney(Math.max(bucket.targetAmount - balance, 0), amountsHidden)} · 已完成 {progress.toFixed(0)}%</small>}
      {bucket.status === 'used' && <small className="text-[var(--book-muted)]">该金额已使用，并已从储蓄总额移除</small>}
      {bucket.status === 'cancelled' && <small className="text-[var(--book-muted)]">专项已取消，剩余金额已退回可支配</small>}
      {getSuggestedMonthlyDeposit(bucket, balance) !== null && !targetReached && <small className="rounded-xl bg-[var(--book-green-soft)] px-3 py-2 text-[var(--book-green)]">按目标日期，建议每月存 {privateMoney(getSuggestedMonthlyDeposit(bucket, balance) ?? 0, amountsHidden)}</small>}
      <div className="grid grid-cols-2 gap-2"><Button color="primary" shape="rounded" disabled={depositDisabled} onClick={onDeposit}>{depositLabel}</Button><Button shape="rounded" disabled={isClosed || balance <= 0} onClick={onWithdraw}>取出</Button></div>
    </article>
  )
}

function SavingsTrend({ movements, amountsHidden }: { movements: ReturnType<typeof summarizeSavingsMonths>; amountsHidden: boolean }) {
  const visible = movements.slice(-6)
  const maximum = Math.max(...visible.map((item) => Math.max(item.deposits, item.withdrawals)), 1)
  return (
    <section className={`${cardClass} grid gap-4`}>
      <div><span className="text-[11px] font-bold tracking-[.12em] text-[var(--book-green)]">储蓄趋势</span><strong className="mt-1 block">近 6 个月存取</strong></div>
      <div className="grid h-36 grid-cols-6 items-end gap-2">
        {visible.map((item) => (
          <div key={item.month} className="grid h-full grid-rows-[1fr_auto] gap-2 text-center">
            <div className="flex items-end justify-center gap-1">
              <i className="w-2 rounded-t bg-[var(--book-green)]" title={`存入 ${privateMoney(item.deposits, amountsHidden)}`} style={{ height: `${Math.max(item.deposits / maximum * 100, item.deposits ? 5 : 0)}%` }} />
              <i className="w-2 rounded-t bg-[var(--book-expense)]" title={`取出 ${privateMoney(item.withdrawals, amountsHidden)}`} style={{ height: `${Math.max(item.withdrawals / maximum * 100, item.withdrawals ? 5 : 0)}%` }} />
            </div>
            <small className="text-[10px] text-[var(--book-muted)]">{Number(item.month.slice(5))}月</small>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 text-xs text-[var(--book-muted)]"><span>● <b className="text-[var(--book-green)]">存入</b></span><span>● <b className="text-[var(--book-expense)]">取出</b></span></div>
    </section>
  )
}

function privateMoney(amount: number, hidden: boolean): string {
  return hidden ? '******' : formatMoney(amount)
}

function roundAmount(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.round(value * 100) / 100
}
