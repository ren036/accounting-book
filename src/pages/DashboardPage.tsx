import { useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { currentMonth } from '../lib/dates'
import { formatMoney } from '../lib/money'
import { cardClass, emptyClass, expenseClass, fixedListContentClass, fixedListHeaderClass, fixedListPageClass, incomeClass } from '../ui/classes'
type DashboardPageProps = {
  transactions: Transaction[]
  onOpen: (id: string) => void
}

export function DashboardPage({ transactions, onOpen }: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const month = currentMonth()
  const summary = summarizeMonth(transactions, month)
  const groups = groupMonthTransactionsByDay(searchTransactions(transactions, searchQuery), month)
  const hasSearchQuery = searchQuery.trim().length > 0

  return (
    <section className={fixedListPageClass}>
      <div className={fixedListHeaderClass}>
                <div className="rounded-[28px] bg-[radial-gradient(circle_at_20%_0%,#4f46e5_0,transparent_34%)] bg-gray-900 p-7 text-white shadow-[0_18px_48px_rgb(17_24_39/24%)] [&>p]:text-gray-300 [&>span]:text-gray-300 [&>strong]:block [&>strong]:text-[42px]">

        {/* <div className="rounded-[28px] bg-[radial-gradient(circle_at_5%_0%,#c7f3df_0,transparent_42%),linear-gradient(135deg,#e4f8ef_0%,#eef3ff_100%)] p-7 text-[#173a2e] shadow-[0_18px_44px_rgb(37_105_76/12%)] [&>p]:text-[#5f776d] [&>span]:text-[#4c6e61] [&>strong]:block [&>strong]:text-[42px]"> */}
          <span>本月结余</span>
          <strong>{formatMoney(summary.balance)}</strong>
          <p>纯本地保存，记得定期导出备份。</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={cardClass}>
            <span>收入</span>
            <strong className={incomeClass}>{formatMoney(summary.income)}</strong>
          </div>
          <div className={cardClass}>
            <span>支出</span>
            <strong className={expenseClass}>{formatMoney(summary.expense)}</strong>
          </div>
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
