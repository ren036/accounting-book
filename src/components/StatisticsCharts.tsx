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
    <section className="analytics-card trend-card" aria-labelledby="monthly-trend-title">
      <div className="analytics-heading">
        <div>
          <span className="eyebrow">年度走势</span>
          <h2 id="monthly-trend-title">月度收支</h2>
        </div>
        <div className="chart-legend" aria-label="图例">
          <span><i className="legend-dot income-dot" />收入</span>
          <span><i className="legend-dot expense-dot" />支出</span>
        </div>
      </div>

      <div className="bar-chart" role="img" aria-label="各月收入与支出柱状图">
        {chronologicalMonths.map((month) => (
          <div className="bar-column" key={month.month} title={`${month.label}：收入 ${formatMoney(month.income)}，支出 ${formatMoney(month.expense)}`}>
            <div className="bar-pair">
              <span
                className="chart-bar income-bar"
                style={{ '--bar-height': `${(month.income / maxAmount) * 100}%` } as CSSProperties}
              />
              <span
                className="chart-bar expense-bar"
                style={{ '--bar-height': `${(month.expense / maxAmount) * 100}%` } as CSSProperties}
              />
            </div>
            <span className="bar-label">{Number(month.month.slice(5))}月</span>
          </div>
        ))}
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
    <section className="analytics-card category-card" aria-labelledby="category-chart-title">
      <div className="analytics-heading">
        <div>
          <span className="eyebrow">消费构成</span>
          <h2 id="category-chart-title">支出分类</h2>
        </div>
      </div>

      {total === 0 ? (
        <div className="chart-empty">暂无支出数据</div>
      ) : (
        <div className="category-chart-layout">
          <div
            className="donut-chart"
            role="img"
            aria-label={`总支出 ${formatMoney(total)}`}
            style={{ background: gradient }}
          >
            <div className="donut-center">
              <span>总支出</span>
              <strong>¥{compactMoney(total)}</strong>
            </div>
          </div>
          <div className="category-legend">
            {displayCategories.map((category, index) => (
              <div className="category-legend-row" key={category.category}>
                <i style={{ backgroundColor: categoryColors[index] }} />
                <span className="category-name">
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
