import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CategorySummary, MonthDetailSummary } from '../domain/summary'
import { formatMoney } from '../lib/money'
import { CategoryEmoji } from './CategoryEmoji'

const colors = ['#07c160', '#ff9f43', '#5b8ff9', '#8b5cf6', '#ec4899', '#94a3b8']

export function MonthlyTrendChart({ months }: { months: MonthDetailSummary[] }) {
  const data = [...months].reverse().map((month) => ({ name: `${Number(month.month.slice(5))}月`, income: month.income, expense: month.expense }))

  return (
    <ChartCard eyebrow="年度走势" title="月度收支">
      {data.length === 0 ? <EmptyChart /> : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#969c98', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#969c98', fontSize: 10 }} width={48} />
              <Tooltip formatter={(value) => `¥${formatMoney(Number(value))}`} contentStyle={{ border: 0, borderRadius: 14, boxShadow: '0 8px 24px rgb(31 35 32 / 10%)' }} />
              <Line type="monotone" dataKey="income" name="收入" stroke="#07c160" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="expense" name="支出" stroke="#ff7a45" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}

export function ExpenseCategoryChart({ categories }: { categories: CategorySummary[] }) {
  const data = groupSmallCategories(categories)
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <ChartCard eyebrow="消费构成" title="支出分类">
      {total === 0 ? <EmptyChart /> : (
        <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-2">
          <div className="relative h-48 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="category" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
                  {data.map((item, index) => <Cell key={item.category} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `¥${formatMoney(Number(value))}`} contentStyle={{ border: 0, borderRadius: 14, boxShadow: '0 8px 24px rgb(31 35 32 / 10%)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-[var(--book-muted)]">总支出</span>
              <strong className="mt-1 text-lg">¥{compactMoney(total)}</strong>
            </div>
          </div>
          <div className="grid gap-2">
            {data.map((item, index) => (
              <div key={item.category} className="grid grid-cols-[8px_minmax(0,1fr)] items-center gap-x-2 text-xs">
                <i className="size-2 rounded-full" style={{ background: colors[index % colors.length] }} />
                <span className="flex min-w-0 items-center gap-1 truncate"><CategoryEmoji category={item.category} size={14} />{item.category}</span>
                <span className="col-start-2 text-[10px] text-[var(--book-muted)]">{Math.round(item.amount / total * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  )
}

function ChartCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-[var(--book-radius-card)] bg-white p-[18px] shadow-[var(--book-shadow-card)]"><span className="mb-1 block text-[11px] font-bold tracking-[.12em] text-[var(--book-green)]">{eyebrow}</span><h2 className="m-0 mb-3 text-lg">{title}</h2>{children}</section>
}

function EmptyChart() { return <div className="grid min-h-48 place-items-center rounded-2xl bg-neutral-50 text-sm text-[var(--book-muted)]">暂无数据</div> }

function groupSmallCategories(categories: CategorySummary[]): CategorySummary[] {
  if (categories.length <= 6) return categories
  return [...categories.slice(0, 5), { category: '其他', amount: categories.slice(5).reduce((sum, item) => sum + item.amount, 0) }]
}

function compactMoney(amount: number): string { return amount >= 10000 ? `${(amount / 10000).toFixed(amount >= 100000 ? 0 : 1)}万` : amount.toFixed(0) }
