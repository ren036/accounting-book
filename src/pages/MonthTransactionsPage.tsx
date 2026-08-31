import { useState } from 'react'
import { TransactionSearch } from '../components/TransactionSearch'
import { TransactionRow } from '../components/TransactionRow'
import { filterMonthTransactionsByType, groupMonthTransactionsByDay, summarizeMonth } from '../domain/summary'
import type { Transaction, TransactionType } from '../domain/transaction'
import { searchTransactions } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { AutoCenter, Button, Segmented } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { cardClass, emptyClass, expenseClass, fixedListContentClass, fixedListHeaderClass, fixedListPageClass, incomeClass, pageTitleClass } from '../ui/classes'

type MonthTransactionsPageProps = {
  month: string
  transactions: Transaction[]
  onBack: () => void
  onOpen: (id: string) => void
}

export function MonthTransactionsPage({ month, transactions, onBack, onOpen }: MonthTransactionsPageProps) {
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [searchQuery, setSearchQuery] = useState('')
  const summary = summarizeMonth(transactions, month)
  const filteredTransactions = searchTransactions(
    filterMonthTransactionsByType(transactions, month, activeType),
    searchQuery
  )
  const groups = groupMonthTransactionsByDay(filteredTransactions, month)
  const label = `${Number(month.slice(5, 7))}月账单`
  const emptyText = searchQuery.trim()
    ? '没有找到匹配的账单'
    : activeType === 'expense' ? '这个月还没有支出' : '这个月还没有收入'

  return (
    <section className={fixedListPageClass}>
      <div className={fixedListHeaderClass}>
        <div className={pageTitleClass}>
          <Button color="primary" fill="none" size="middle" aria-label="返回" onClick={onBack}>
            <LeftOutline fontSize={22} />
          </Button>
          <AutoCenter>{label}</AutoCenter>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={cardClass}>
            <span>收入</span>
            <strong className={incomeClass}>{formatMoney(summary.income)}</strong>
          </div>
          <div className={cardClass}>
            <span>支出</span>
            <strong className={expenseClass}>{formatMoney(summary.expense)}</strong>
          </div>
          <div className={cardClass}>
            <span>结余</span>
            <strong>{formatMoney(summary.balance)}</strong>
          </div>
        </div>
        <Segmented block className="w-full" options={[
          { label: '支出', value: 'expense' },
          { label: '收入', value: 'income' },
        ]}
          value={activeType}
          onChange={(value) => setActiveType(value as TransactionType)}
        />
        <TransactionSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <section className={`${fixedListContentClass} grid content-start gap-2.5`}>
        {groups.length === 0 ? (
          <p className={emptyClass}>{emptyText}</p>
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
