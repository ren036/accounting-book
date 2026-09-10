import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CategorySummary, MonthDetailSummary } from '../domain/summary'
import { formatMoney } from '../lib/money'
import { CategoryEmoji, getCategoryVisual } from './CategoryEmoji'
import { Box, Center, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'

const chartTooltipStyle = { border: 0, borderRadius: 14, boxShadow: '0 8px 24px rgb(31 35 32 / 10%)' }

export function MonthlyTrendChart({ months, expenseLabel = '支出' }: { months: MonthDetailSummary[]; expenseLabel?: string }) {
  const data = [...months].reverse().map((month) => ({ name: `${Number(month.month.slice(5))}月`, income: month.income, expense: month.expense }))

  return (
    <ChartCard eyebrow="年度走势" title="月度收支">
      {data.length === 0 ? <EmptyChart /> : (
        <Box h={208} w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#747782', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#747782', fontSize: 10 }} width={48} />
              <Tooltip formatter={(value) => `¥${formatMoney(Number(value))}`} contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="income" name="收入" stroke="#16a574" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="expense" name={expenseLabel} stroke="#df626d" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartCard>
  )
}

export function ExpenseCategoryChart({ categories, daily = false }: { categories: CategorySummary[]; daily?: boolean }) {
  return <CategoryChart categories={categories} eyebrow="消费构成" title={daily ? '日常消费分类' : '支出分类'} totalLabel={daily ? '日常消费' : '总支出'} />
}

export function CategoryChart({
  categories,
  eyebrow,
  title,
  totalLabel,
}: {
  categories: CategorySummary[]
  eyebrow: string
  title: string
  totalLabel: string
}) {
  const data = groupSmallCategories(categories)
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <ChartCard eyebrow={eyebrow} title={title}>
      {total === 0 ? <EmptyChart /> : (
        <SimpleGrid cols={2} spacing="xs" style={{ gridTemplateColumns: 'minmax(0, 1fr) 112px', alignItems: 'center' }}>
          <Box pos="relative" h={192} miw={0}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="category" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
                  {data.map((item) => <Cell key={item.category} fill={getCategoryVisual(item.category).color} />)}
                </Pie>
                <Tooltip formatter={(value) => `¥${formatMoney(Number(value))}`} contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <Center pos="absolute" inset={0} style={{ pointerEvents: 'none' }}><Stack gap={2} align="center"><Text size="xs" c="dimmed">{totalLabel}</Text><Text fz="lg" fw={700}>¥{compactMoney(total)}</Text></Stack></Center>
          </Box>
          <Stack gap="xs">
            {data.map((item) => (
              <Box key={item.category}>
                <Group gap={6} wrap="nowrap"><Box w={8} h={8} style={{ flexShrink: 0, borderRadius: '50%', background: getCategoryVisual(item.category).color }} /><Text size="xs" truncate><CategoryEmoji category={item.category} size={14} /> {item.category}</Text></Group>
                <Text ml={14} size="xs" c="dimmed">
                  {Math.round(item.amount / total * 100)}% · ¥{formatMoney(item.amount)}
                </Text>
              </Box>
            ))}
          </Stack>
        </SimpleGrid>
      )}
    </ChartCard>
  )
}

function ChartCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <Paper component="section" miw={0} p={18}><Text size="xs" fw={700} tt="uppercase" c="teal.7">{eyebrow}</Text><Title order={2} size="h4" mb="md">{title}</Title>{children}</Paper>
}

function EmptyChart() { return <Center mih={192} bg="gray.0" style={{ borderRadius: 16 }}><Text size="sm" c="dimmed">暂无数据</Text></Center> }

function groupSmallCategories(categories: CategorySummary[]): CategorySummary[] {
  if (categories.length <= 6) return categories
  return [...categories.slice(0, 5), { category: '其他', amount: categories.slice(5).reduce((sum, item) => sum + item.amount, 0) }]
}

function compactMoney(amount: number): string { return amount >= 10000 ? `${(amount / 10000).toFixed(amount >= 100000 ? 0 : 1)}万` : amount.toFixed(0) }
