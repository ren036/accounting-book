import { useRef, useState } from 'react'
import { Button, Dialog, Toast } from 'antd-mobile'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import type { MonthlyBudget } from '../domain/budget'
import { summarizeBudget, summarizeDailyExpense } from '../domain/budget'
import { searchTransactions } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { ArrowRight, Eye, EyeOff, Landmark, PiggyBank } from 'lucide-react'
import { cardClass, emptyClass, fixedListContentClass, fixedListHeaderClass, fixedListPageClass } from '../ui/classes'
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
  const budgetBarPercentage = budgetProgress ? Math.min(Math.max(budgetProgress.percentage, 0), 100) : 0
  const groups = groupMonthTransactionsByDay(searchTransactions(transactions, searchQuery), month)
  const hasSearchQuery = searchQuery.trim().length > 0

  async function handleBackgroundFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      Toast.show({ content: '请选择图片文件' })
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      Toast.show({ content: '图片不能超过 8MB' })
      return
    }

    await onBalanceCardBackgroundChange(await readFileAsDataUrl(file))
    Toast.show({ content: '背景已更新' })
  }

  function handleBackgroundButton() {
    if (!balanceCardBackground) {
      backgroundInputRef.current?.click()
      return
    }
    Dialog.show({
      content: '更换或恢复本月结余卡片背景',
      actions: [
        { key: 'change', text: '选择新图片' },
        { key: 'reset', text: '恢复默认背景', danger: true },
        { key: 'cancel', text: '取消' }
      ],
      closeOnAction: true,
      onAction: async (action) => {
        if (action.key === 'change') backgroundInputRef.current?.click()
        if (action.key === 'reset') {
          await onBalanceCardBackgroundChange(null)
          Toast.show({ content: '已恢复默认背景' })
        }
      }
    })
  }

  return (
    <section className={fixedListPageClass}>
      <div className={fixedListHeaderClass}>
        <div
          className="relative flex min-h-[150px] flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_20%_0%,#4f46e5_0,transparent_34%)] bg-cover bg-center bg-gray-900 p-7 pb-4 text-white shadow-[0_18px_48px_rgb(17_24_39/24%)] [&>span]:text-gray-300 [&>strong]:block [&>strong]:text-[42px]"
          style={balanceCardBackground ? { backgroundImage: `linear-gradient(rgb(10 15 20 / 45%), rgb(10 15 20 / 62%)), url(${JSON.stringify(balanceCardBackground)})` } : undefined}
        >
          <span>当前可支配</span>
          <strong>{privateMoney(disposableBalance, savingsAmountsHidden)}</strong>
          <button type="button" className="absolute right-4 top-4 rounded-full border-0 bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm" onClick={handleBackgroundButton}>
            更换背景
          </button>
          <input ref={backgroundInputRef} className="hidden" type="file" accept="image/*" onChange={handleBackgroundFile} />
          <div className="mt-auto flex items-center gap-3 whitespace-nowrap pt-5 text-sm text-white">
            <span className="!text-white">月收入：{formatMoney(summary.income)}</span>
            <span className="!text-white">月支出：{formatMoney(summary.expense)}</span>
          </div>
        </div>
        <div className="grid gap-3">
          <article className={`${cardClass} flex w-full items-center gap-2 border-0`}>
            <button type="button" className="flex min-w-0 flex-1 items-center justify-between gap-3 border-0 bg-transparent p-0 text-left text-inherit" onClick={onOpenSavings}>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="rounded-full bg-[var(--book-green-soft)] p-2 text-[var(--book-green)]"><Landmark size={20} /></span>
                <div><strong className="block">我的储蓄</strong><span className="text-xs text-[var(--book-muted)]">通用储蓄与专项资金</span></div>
              </div>
              <strong className="whitespace-nowrap text-[var(--book-green)]">{privateMoney(totalSavings, savingsAmountsHidden)}</strong>
            </button>
            <button type="button" className="shrink-0 rounded-full border-0 bg-[var(--book-green-soft)] p-2 text-[var(--book-green)]" aria-label={savingsAmountsHidden ? '显示储蓄金额' : '隐藏储蓄金额'} onClick={() => void onSavingsAmountsHiddenChange(!savingsAmountsHidden)}>
              {savingsAmountsHidden ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <ArrowRight className="shrink-0 text-[var(--book-green)]" size={16} />
          </article>
          <button type="button" className={`${cardClass} grid w-full gap-3 border-0 text-left`} onClick={onOpenBudget}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-[var(--book-green-soft)] p-2 text-[var(--book-green)]"><PiggyBank size={20} /></span>
                <div>
                  <strong className="block">本月预算</strong>
                  <span className="text-xs text-[var(--book-muted)]">{budget ? `日常消费 ${formatMoney(budgetProgress?.spent ?? 0)} / ${formatMoney(budget.amount)}` : '还没有设置预算'}</span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-sm text-[var(--book-green)]">{budgetProgress ? `${budgetProgress.percentage.toFixed(0)}%` : '去设置'}<ArrowRight size={16} /></span>
            </div>
            {budgetProgress ? (
              <>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full transition-[width] ${budgetProgress.percentage > 100 ? 'bg-[var(--book-expense)]' : 'bg-[var(--book-green)]'}`} style={{ width: `${budgetBarPercentage}%` }} />
                </div>
                <div className="flex justify-between text-xs text-[var(--book-muted)]">
                  <span>{budgetProgress.remaining >= 0 ? `剩余 ${formatMoney(budgetProgress.remaining)}` : `超出 ${formatMoney(Math.abs(budgetProgress.remaining))}`}</span>
                  <span>{month.replace('-', '年')}月</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xs text-[var(--book-muted)]">
                <span>本月日常消费</span>
                <strong className="text-sm text-[var(--book-expense)]">{formatMoney(dailyExpense)}</strong>
                <span>{month.replace('-', '年')}月</span>
              </div>
            )}
          </button>
        </div>
        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className={`${fixedListContentClass} grid content-start gap-3 [&>h2]:my-[8px_14px] [&>h2]:text-xl`}>
        <h2>当月账单详情</h2>
        {groups.length === 0 ? (
          <p className={emptyClass}>{hasSearchQuery ? '没有找到匹配的账单' : '这个月还没有账单'}</p>
        ) : (
          <div>
            {groups.map((group) => (
              <section className="daily-group" key={group.date}>
                {group.label}
                <div className="grid gap-2.5">
                  {group.transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} onOpen={onOpen} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </section>
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
