import type { CSSProperties } from 'react'
import { CategoryEmoji } from './CategoryEmoji'
import type { CategorySummary, MonthDetailSummary } from '../domain/summary'
import { formatMoney } from '../lib/money'

type MonthlyTrendChartProps = {
  months: MonthDetailSummary[]
}

export function MonthlyTrendChart({ months }: MonthlyTrendChartProps) {
  const chronologicalMonths = [...months].reverse()
  const maxAmount = Math.max(1, ...chronologicalMonths.flatMap((month) => [month.income, month.expense]))

  return (
    <section className="min-w-0 rounded-[22px] border border-white/80 bg-white/90 p-[18px] shadow-[0_12px_30px_rgb(15_23_42/7%)]" aria-labelledby="monthly-trend-title">
      <div className="mb-4 flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:text-lg">
        <div>
          <span className="mb-1 block text-[11px] font-extrabold tracking-[.12em] text-violet-600">年度走势</span>
          <h2 id="monthly-trend-title">月度收支</h2>
        </div>
        <div className="flex gap-2.5 text-[11px] text-slate-500 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1" aria-label="图例">
          <span><i className="h-[7px] w-[7px] rounded-full bg-[linear-gradient(180deg,#34d399,#059669)]" />收入</span>
          <span><i className="h-[7px] w-[7px] rounded-full bg-[linear-gradient(180deg,#fb923c,#ea580c)]" />支出</span>
        </div>
      </div>

      <div className="overflow-x-auto overscroll-x-contain pb-1">
        <div className="grid h-[156px] min-w-[480px] grid-cols-12 items-end gap-1.5 bg-[repeating-linear-gradient(to_bottom,#e2e8f0_0_1px,transparent_1px_48px)] pt-1.5" role="img" aria-label="各月收入与支出柱状图">
          {chronologicalMonths.map((month) => (
            <div className="grid min-w-0 grid-rows-[126px_18px] items-end gap-1.5" key={month.month} title={`${month.label}：收入 ${formatMoney(month.income)}，支出 ${formatMoney(month.expense)}`}>
              <div className="flex h-full items-end justify-center gap-[3px]">
                <span
                  className="h-[max(3px,var(--bar-height))] w-[min(9px,42%)] origin-bottom rounded-[5px_5px_2px_2px] bg-[linear-gradient(180deg,#34d399,#059669)]"
                  style={{ '--bar-height': `${(month.income / maxAmount) * 100}%` } as CSSProperties}
                />
                <span
                  className="h-[max(3px,var(--bar-height))] w-[min(9px,42%)] origin-bottom rounded-[5px_5px_2px_2px] bg-[linear-gradient(180deg,#fb923c,#ea580c)]"
                  style={{ '--bar-height': `${(month.expense / maxAmount) * 100}%` } as CSSProperties}
                />
              </div>
              <span className="overflow-hidden text-center text-[10px] whitespace-nowrap text-slate-400">{Number(month.month.slice(5))}月</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type ExpenseCategoryChartProps = {
  categories: CategorySummary[]
}

const categoryColors = ['#7c3aed', '#f97316', '#0ea5e9', '#10b981', '#f43f5e', '#94a3b8']

export function ExpenseCategoryChart({ categories }: ExpenseCategoryChartProps) {
  const displayCategories = groupSmallCategories(categories)
  const total = displayCategories.reduce((sum, category) => sum + category.amount, 0)
  const gradient = buildConicGradient(displayCategories, total)

  return (
    <section className="min-w-0 rounded-[22px] border border-white/80 bg-white/90 p-[18px] shadow-[0_12px_30px_rgb(15_23_42/7%)]" aria-labelledby="category-chart-title">
      <div className="mb-4 flex items-start justify-between gap-3 [&_h2]:m-0 [&_h2]:text-lg">
        <div>
          <span className="mb-1 block text-[11px] font-extrabold tracking-[.12em] text-violet-600">消费构成</span>
          <h2 id="category-chart-title">支出分类</h2>
        </div>
      </div>

      {total === 0 ? (
        <div className="grid min-h-[156px] place-items-center rounded-2xl bg-slate-50 text-[13px] text-slate-400">暂无支出数据</div>
      ) : (
        <div className="grid grid-cols-[116px_minmax(0,1fr)] items-center gap-[18px]">
          <div
            className="grid aspect-square w-[116px] place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/60%)]"
            role="img"
            aria-label={`总支出 ${formatMoney(total)}`}
            style={{ background: gradient }}
          >
            <div className="grid aspect-square w-[70%] place-items-center rounded-full bg-white shadow-[0_5px_16px_rgb(15_23_42/10%)] [&>span]:self-end [&>span]:text-[10px] [&>span]:text-slate-400 [&>strong]:self-start [&>strong]:text-[15px]">
              <span>总支出</span>
              <strong>¥{compactMoney(total)}</strong>
            </div>
          </div>
          <div className="grid min-w-0 gap-[7px]">
            {displayCategories.map((category, index) => (
              <div className="grid grid-cols-[7px_minmax(60px,1fr)_auto] items-center gap-1.5 text-xs [&>i]:h-[7px] [&>i]:w-[7px] [&>i]:rounded-full [&>small]:col-[2/-1] [&>small]:text-[10px] [&>small]:text-slate-400" key={category.category}>
                <i style={{ backgroundColor: categoryColors[index] }} />
                <span className="truncate [&>span]:mr-1">
                  {category.category !== '其他分类' && <CategoryEmoji category={category.category} />}
                  {category.category}
                </span>
                <strong>{Math.round((category.amount / total) * 100)}%</strong>
                <small>¥{formatMoney(category.amount)}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function groupSmallCategories(categories: CategorySummary[]): CategorySummary[] {
  if (categories.length <= 6) return categories

  const leading = categories.slice(0, 5)
  return [
    ...leading,
    {
      category: '其他分类',
      amount: categories.slice(5).reduce((sum, category) => sum + category.amount, 0)
    }
  ]
}

function buildConicGradient(categories: CategorySummary[], total: number): string {
  if (total === 0) return '#e2e8f0'

  let cursor = 0
  const segments = categories.map((category, index) => {
    const start = cursor
    cursor += (category.amount / total) * 100
    return `${categoryColors[index]} ${start}% ${cursor}%`
  })

  return `conic-gradient(${segments.join(', ')})`
}

function compactMoney(amount: number): string {
  if (amount >= 10000) return `${(amount / 10000).toFixed(amount >= 100000 ? 0 : 1)}万`
  return amount.toFixed(0)
}
