import { useState } from 'react'
import { AutoCenter, Segmented } from 'antd-mobile'
import type { MonthlyBudget } from '../domain/budget'
import type { SavingsBucket, SavingsMovement } from '../domain/savings'
import type { Transaction } from '../domain/transaction'
import { pageClass } from '../ui/classes'
import { BudgetPage } from './BudgetPage'
import { SavingsPage } from './SavingsPage'

type FundsPageProps = {
  transactions: Transaction[]
  budgets: MonthlyBudget[]
  savingsBuckets: SavingsBucket[]
  savingsMovements: SavingsMovement[]
  openingDisposableBalance: number
  amountsHidden: boolean
  initialTab?: 'budget' | 'savings'
  onBudgetsChanged: () => Promise<void>
  onSavingsChanged: () => Promise<void>
  onOpeningBalanceChange: (value: number) => Promise<void>
  onOpenMonth: (month: string) => void
}

export function FundsPage(props: FundsPageProps) {
  const [tab, setTab] = useState<'budget' | 'savings'>(props.initialTab ?? 'savings')

  return (
    <section className={`${pageClass} flex h-full min-h-0 flex-col gap-3 p-3`}>
      <AutoCenter className="text-xl">资金</AutoCenter>
      <Segmented block options={[{ label: '储蓄', value: 'savings' },{ label: '预算', value: 'budget' }]} value={tab} onChange={(value) => setTab(value as 'budget' | 'savings')} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {tab === 'budget' ? (
          <BudgetPage embedded transactions={props.transactions} budgets={props.budgets} onChanged={props.onBudgetsChanged} onOpenMonth={props.onOpenMonth} />
        ) : (
          <SavingsPage
            transactions={props.transactions}
            buckets={props.savingsBuckets}
            movements={props.savingsMovements}
            openingDisposableBalance={props.openingDisposableBalance}
            amountsHidden={props.amountsHidden}
            onChanged={props.onSavingsChanged}
            onOpeningBalanceChange={props.onOpeningBalanceChange}
          />
        )}
      </div>
    </section>
  )
}
