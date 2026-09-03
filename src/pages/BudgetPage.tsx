import { useEffect, useMemo, useState } from 'react'
import { AutoCenter, Button, Dialog, Toast } from 'antd-mobile'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget } from '../domain/budget'
import type { Transaction } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { deleteBudget, saveBudget } from '../lib/db'
import { formatMoney } from '../lib/money'
import { cardClass, fieldClass, pageClass } from '../ui/classes'

type BudgetPageProps = {
  embedded?: boolean
  transactions: Transaction[]
  budgets: MonthlyBudget[]
  onChanged: () => Promise<void>
  onOpenMonth: (month: string) => void
}

export function BudgetPage({ embedded = false, transactions, budgets, onChanged, onOpenMonth }: BudgetPageProps) {
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
      Toast.show({ content: '请输入大于 0 的预算金额' })
      return
    }

    await saveBudget({ month, amount: Math.round(numericAmount * 100) / 100 })
    await onChanged()
    Toast.show({ content: '预算已保存' })
  }

  async function handleDelete() {
    if (!activeBudget) return
    const confirmed = await Dialog.confirm({
      content: `确定清除 ${month.replace('-', '年')}月的预算吗？`,
      confirmText: '清除',
      cancelText: '取消'
    })
    if (!confirmed) return
    await deleteBudget(month)
    await onChanged()
    Toast.show({ content: '预算已清除' })
  }

  return (
    <section className={embedded ? '' : `${pageClass} h-full overflow-y-auto p-3`}>
      {!embedded && <AutoCenter className="mb-3 text-xl">月度预算</AutoCenter>}

      <div className="grid gap-3">
        <label className={fieldClass}>
          <span>选择月份</span>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value || currentMonth())} />
        </label>

        <button type="button" className={`${cardClass} grid w-full gap-4 text-left text-inherit`} onClick={() => onOpenMonth(month)} aria-label={`查看${month}月详细账单`}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="text-sm text-[var(--book-muted)]">{activeBudget ? '本月预算' : '尚未设置预算'}</span>
              <strong className="mt-1 block text-3xl">{activeBudget ? formatMoney(activeBudget.amount) : '—'}</strong>
            </div>
            {progress && <span className={progress.remaining < 0 ? 'text-[var(--book-expense)]' : 'text-[var(--book-green)]'}>{progress.percentage.toFixed(0)}%</span>}
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-100" aria-label="预算使用进度">
            <div className={`h-full rounded-full transition-[width] ${progress && progress.percentage > 100 ? 'bg-[var(--book-expense)]' : 'bg-[var(--book-green)]'}`} style={{ width: `${barPercentage}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="block text-[var(--book-muted)]">日常消费</span><strong className="mt-1 block text-lg">{formatMoney(progress?.spent ?? 0)}</strong></div>
            <div><span className="block text-[var(--book-muted)]">{progress && progress.remaining < 0 ? '已超出' : '剩余'}</span><strong className={`mt-1 block text-lg ${progress && progress.remaining < 0 ? 'text-[var(--book-expense)]' : ''}`}>{formatMoney(Math.abs(progress?.remaining ?? 0))}</strong></div>
          </div>
          <span className="text-right text-xs font-semibold text-[var(--book-green)]">查看本月详细账单 →</span>
        </button>

        <form className={`${cardClass} grid gap-3`} onSubmit={handleSave}>
          <label className="grid gap-2">
            <span>预算金额</span>
            <input className="box-border w-full rounded-[var(--book-radius-control)] border border-[var(--book-border)] bg-white/60 p-3 text-base" type="number" inputMode="decimal" min="1" step="1" placeholder="请输入本月预算" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <Button color="primary" shape="rounded" type="submit">{activeBudget ? '更新预算' : '设置预算'}</Button>
          {activeBudget && <Button className="!text-[var(--book-expense)]" fill="none" type="button" onClick={handleDelete}>清除本月预算</Button>}
        </form>
      </div>
    </section>
  )
}
