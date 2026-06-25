import { useEffect, useState } from 'react'
import { BottomNav, type PageKey } from './components/BottomNav'
import type { Transaction } from './domain/transaction'
import { deleteTransaction, listTransactions } from './lib/db'
import { DashboardPage } from './pages/DashboardPage'
import { EditTransactionPage } from './pages/EditTransactionPage'
import { EntryPage } from './pages/EntryPage'
import { MonthTransactionsPage } from './pages/MonthTransactionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { StatsPage } from './pages/StatsPage'

export function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [viewingStatsMonth, setViewingStatsMonth] = useState<string | null>(null)

  async function reloadTransactions() {
    setTransactions(await listTransactions())
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    await reloadTransactions()
    setEditingTransactionId(null)
    setViewingStatsMonth(null)
    setCurrentPage('dashboard')
  }

  async function handleEditSaved() {
    await reloadTransactions()
    setEditingTransactionId(null)
  }

  useEffect(() => {
    void reloadTransactions()
  }, [])

  const editingTransaction = editingTransactionId
    ? transactions.find((transaction) => transaction.id === editingTransactionId)
    : null

  return (
    <main className="app">
      {editingTransaction ? (
        <EditTransactionPage
          transaction={editingTransaction}
          onCancel={() => setEditingTransactionId(null)}
          onDeleted={handleDelete}
          onSaved={handleEditSaved}
        />
      ) : (
        <>
          {currentPage === 'dashboard' && <DashboardPage transactions={transactions} onEdit={setEditingTransactionId} />}
          {currentPage === 'entry' && <EntryPage onSaved={reloadTransactions} />}
          {currentPage === 'stats' && viewingStatsMonth === null && (
            <StatsPage transactions={transactions} onOpenMonth={setViewingStatsMonth} />
          )}
          {currentPage === 'stats' && viewingStatsMonth !== null && (
            <MonthTransactionsPage
              month={viewingStatsMonth}
              transactions={transactions}
              onBack={() => setViewingStatsMonth(null)}
              onEdit={setEditingTransactionId}
            />
          )}
          {currentPage === 'settings' && <SettingsPage onChanged={reloadTransactions} />}
        </>
      )}
      <BottomNav
        currentPage={currentPage}
        onChange={(page) => {
          setCurrentPage(page)
          setViewingStatsMonth(null)
        }}
      />
    </main>
  )
}
