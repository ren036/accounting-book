import { lazy, Suspense, useEffect, useState } from 'react'
import { BottomNav, type PageKey } from './components/BottomNav'
import { finishCreatingTransaction, switchMainTab } from './domain/navigation'
import type { Transaction } from './domain/transaction'
import { deleteTransaction, listTransactions } from './lib/db'
import { DashboardPage } from './pages/DashboardPage'
import { EditTransactionPage } from './pages/EditTransactionPage'
import { EntryPage } from './pages/EntryPage'
import { MonthTransactionsPage } from './pages/MonthTransactionsPage'
import { TransactionDetailPage } from './pages/TransactionDetailPage'
import { emptyClass, pageClass } from './ui/classes'

const SettingsPage = lazy(async () => {
  const module = await import('./pages/SettingsPage')
  return { default: module.SettingsPage }
})

const StatsPage = lazy(async () => {
  const module = await import('./pages/StatsPage')
  return { default: module.StatsPage }
})

export function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [viewingTransactionId, setViewingTransactionId] = useState<string | null>(null)
  const [viewingStatsMonth, setViewingStatsMonth] = useState<string | null>(null)

  async function reloadTransactions() {
    setTransactions(await listTransactions())
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
    void reloadTransactions()
  }, [])

  useEffect(() => {
    const viewport = window.visualViewport

    function syncVisualViewportHeight() {
      const height = viewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--visual-viewport-height', `${height}px`)
    }

    syncVisualViewportHeight()
    viewport?.addEventListener('resize', syncVisualViewportHeight)
    window.addEventListener('resize', syncVisualViewportHeight)

    return () => {
      viewport?.removeEventListener('resize', syncVisualViewportHeight)
      window.removeEventListener('resize', syncVisualViewportHeight)
      document.documentElement.style.removeProperty('--visual-viewport-height')
    }
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
    && (currentPage === 'dashboard' || currentPage === 'stats')

  return (
    <main
      className={`min-h-dvh bg-[var(--book-bg)] p-3 font-sans text-[var(--book-text)] ${isTransactionFormPage ? 'fixed inset-x-0 top-0 box-border min-h-0 w-full overflow-hidden' : ''} ${isFixedListPage ? 'flex h-dvh min-h-0 flex-col overflow-hidden pb-[calc(64px+env(safe-area-inset-bottom))]' : ''}`}
      style={isTransactionFormPage ? { height: 'var(--visual-viewport-height, 100dvh)', minHeight: 0 } : undefined}
    >
      {editingTransaction ? (
        <EditTransactionPage
          transaction={editingTransaction}
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
          {currentPage === 'dashboard' && <DashboardPage transactions={transactions} onOpen={setViewingTransactionId} />}
          {currentPage === 'entry' && (
            <EntryPage
              onCancel={() => applyNavigationState(finishCreatingTransaction())}
              onSaved={handleEntrySaved}
            />
          )}
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
              <SettingsPage onChanged={reloadTransactions} />
            </Suspense>
          )}
        </>
      )}
      {!isTransactionFormPage && (
        <BottomNav
          currentPage={currentPage}
          onChange={(page) => applyNavigationState(switchMainTab(page))}
        />
      )}
    </main>
  )
}
