import { AutoCenter, Button, Dialog } from 'antd-mobile'
import { CategoryEmoji } from '../components/CategoryEmoji'
import type { Transaction } from '../domain/transaction'
import { getTransactionNoteDisplay } from '../domain/transaction'
import { formatMoney } from '../lib/money'
import { DeleteOutline, LeftOutline } from 'antd-mobile-icons'
import { cardClass, expenseClass, incomeClass, pageClass, pageTitleClass } from '../ui/classes'

type TransactionDetailPageProps = {
  transaction: Transaction
  onBack: () => void
  onDeleted: (id: string) => Promise<void>
  onEdit: () => void
}

export function TransactionDetailPage({ transaction, onBack, onDeleted, onEdit }: TransactionDetailPageProps) {
  const isIncome = transaction.type === 'income'
  const note = getTransactionNoteDisplay(transaction.note)

  async function handleDelete() {
    const confirmed = await Dialog.confirm({
      content: '确定删除这笔账单吗？',
      confirmText: '删除',
      cancelText: '取消'
    })

    if (confirmed) await onDeleted(transaction.id)
  }

  return (
    <section className={`${pageClass} p-3`}>
      <div className={pageTitleClass}>
        <Button color="primary" fill="none" size="middle" aria-label="返回" onClick={onBack}>
          <LeftOutline fontSize={22} color='black' scale={2.2} />
        </Button>
        <AutoCenter className="text-lg">账单详情</AutoCenter>
        <Button color="danger" fill="none" size="middle" aria-label="删除账单" onClick={handleDelete}>
          <DeleteOutline fontSize={22} />
        </Button>
      </div>

      <article className={`${cardClass} grid gap-[22px]`}>
        <div className="grid justify-items-center gap-1.5 py-3.5 [&>small]:text-gray-500 [&>strong]:text-[38px]">
          <span className="!m-0 !inline-flex items-center gap-2">
            <CategoryEmoji category={transaction.category} />
            {transaction.category}
          </span>
          <strong className={isIncome ? incomeClass : expenseClass}>
            {isIncome ? '+' : '-'}{formatMoney(transaction.amount)}
          </strong>
          <small>{isIncome ? '收入' : '支出'}</small>
        </div>

        <dl className="m-0 grid gap-0 [&>div]:grid [&>div]:grid-cols-[auto_minmax(0,1fr)] [&>div]:gap-6 [&>div]:border-t [&>div]:border-gray-200 [&>div]:py-3.5 [&_dd]:text-right">
          <div><dt>日期</dt><dd>{transaction.occurredAt.slice(0, 10)}</dd></div>
          <div><dt>备注</dt><dd>{note ?? '无备注'}</dd></div>
          {!isIncome && <div><dt>月度预算</dt><dd>{transaction.includeInBudget !== false ? '计入' : '不计入'}</dd></div>}
        </dl>

        <Button color='primary' fill='outline' shape='rounded' type="button" onClick={onEdit} >
           编辑
          </Button>
      </article>
    </section>
  )
}
