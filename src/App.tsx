import { lazy, Suspense, useEffect, useState } from 'react'
import { BottomNav, type PageKey } from './components/BottomNav'
import { finishCreatingTransaction, switchMainTab } from './domain/navigation'
import type { Transaction } from './domain/transaction'
import type { MonthlyBudget } from './domain/budget'
import { deleteTransaction, getPreference, listBudgets, listTransactions, setPreference } from './lib/db'
import { BudgetPage } from './pages/BudgetPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditTransactionPage } from './pages/EditTransactionPage'
import { EntryPage } from './pages/EntryPage'
import { MonthTransactionsPage } from './pages/MonthTransactionsPage'
import { TransactionDetailPage } from './pages/TransactionDetailPage'
import { emptyClass, pageClass } from './ui/classes'
import { useKeyboardViewportFrame } from './hooks/useKeyboardViewportFrame'

const SettingsPage = lazy(async () => {
  const module = await import('./pages/SettingsPage')
  return { default: module.SettingsPage }
})

const StatsPage = lazy(async () => {
  const module = await import('./pages/StatsPage')
  return { default: module.StatsPage }
})

export function App() {
  const { isKeyboardOpen, viewportHeight, offsetTop } = useKeyboardViewportFrame()

  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([])
  const [balanceCardBackground, setBalanceCardBackground] = useState<string | null>(null)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [viewingTransactionId, setViewingTransactionId] = useState<string | null>(null)
  const [viewingStatsMonth, setViewingStatsMonth] = useState<string | null>(null)

  async function reloadTransactions() {
    setTransactions(await listTransactions())
  }

  async function reloadBudgets() {
    setBudgets(await listBudgets())
  }

  async function reloadAllData() {
    await Promise.all([
      reloadTransactions(),
      reloadBudgets(),
      getPreference('balance-card-background').then(setBalanceCardBackground)
    ])
  }

  async function handleBalanceCardBackgroundChange(value: string | null) {
    await setPreference('balance-card-background', value)
    setBalanceCardBackground(value)
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    await reloadTransactions()
    setEditingTransactionId(null)
    setViewingTransactionId(null)
  }

  async function handleEditSaved() {
    await reloadTransactions()
    setEditingTransactionId(null)
  }

  async function handleEntrySaved() {
    await reloadTransactions()
    applyNavigationState(finishCreatingTransaction())
  }

  function applyNavigationState(state: {
    currentPage: PageKey
    editingTransactionId: string | null
    viewingStatsMonth: string | null
  }) {
    setCurrentPage(state.currentPage)
    setEditingTransactionId(state.editingTransactionId)
    setViewingTransactionId(null)
    setViewingStatsMonth(state.viewingStatsMonth)
  }

  useEffect(() => {
    void reloadAllData()
  }, [])

  const editingTransaction = editingTransactionId
    ? transactions.find((transaction) => transaction.id === editingTransactionId)
    : null
  const viewingTransaction = viewingTransactionId
    ? transactions.find((transaction) => transaction.id === viewingTransactionId)
    : null
  const isTransactionFormPage = Boolean(editingTransaction) || (!viewingTransaction && currentPage === 'entry')
  const isFixedListPage = !editingTransaction
    && !viewingTransaction
    && (currentPage === 'dashboard' || currentPage === 'budget' || currentPage === 'stats')

  return (
    <main
      className={`min-h-dvh bg-[var(--book-bg)] font-sans text-[var(--book-text)] ${isTransactionFormPage ? 'fixed inset-x-0 box-border min-h-0 w-full overflow-hidden pt-3' : ''} ${isFixedListPage ? 'flex h-dvh min-h-0 flex-col overflow-hidden pb-[calc(64px+env(safe-area-inset-bottom))]' : ''}`}
      style={isTransactionFormPage ? {
        height: viewportHeight > 0 ? `${viewportHeight}px` : '100dvh',
        minHeight: 0,
        top: `${offsetTop}px`,
      } : undefined}
    >
      {editingTransaction ? (
        <EditTransactionPage
          transaction={editingTransaction}
          viewportHeight={viewportHeight}
          onCancel={() => setEditingTransactionId(null)}
          onSaved={handleEditSaved}
        />
      ) : viewingTransaction ? (
        <TransactionDetailPage
          transaction={viewingTransaction}
          onBack={() => setViewingTransactionId(null)}
          onDeleted={handleDelete}
          onEdit={() => setEditingTransactionId(viewingTransaction.id)}
        />
      ) : (
        <>
          {currentPage === 'dashboard' && (
            <DashboardPage
              transactions={transactions}
              budgets={budgets}
              balanceCardBackground={balanceCardBackground}
              onOpen={setViewingTransactionId}
              onOpenBudget={() => applyNavigationState(switchMainTab('budget'))}
              onBalanceCardBackgroundChange={handleBalanceCardBackgroundChange}
            />
          )}
          {currentPage === 'entry' && (
            <EntryPage
              viewportHeight={viewportHeight}
              onCancel={() => applyNavigationState(finishCreatingTransaction())}
              onSaved={handleEntrySaved}
            />
          )}
          {currentPage === 'budget' && <BudgetPage transactions={transactions} budgets={budgets} onChanged={reloadBudgets} />}
          {currentPage === 'stats' && viewingStatsMonth === null && (
            <Suspense fallback={<section className={pageClass}><p className={emptyClass}>正在加载统计...</p></section>}>
              <StatsPage transactions={transactions} onOpenMonth={setViewingStatsMonth} />
            </Suspense>
          )}
          {currentPage === 'stats' && viewingStatsMonth !== null && (
            <MonthTransactionsPage
              month={viewingStatsMonth}
              transactions={transactions}
              onBack={() => setViewingStatsMonth(null)}
              onOpen={setViewingTransactionId}
            />
          )}
          {currentPage === 'settings' && (
            <Suspense fallback={<section className={pageClass}><p className={emptyClass}>正在加载设置...</p></section>}>
              <SettingsPage onChanged={reloadAllData} />
            </Suspense>
          )}
        </>
      )}
      {!isTransactionFormPage && !isKeyboardOpen && (
        <BottomNav
          currentPage={currentPage}
          onChange={(page) => applyNavigationState(switchMainTab(page))}
        />
      )}
    </main>
  )
}
