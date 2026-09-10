import { lazy, Suspense, useEffect, useState } from 'react'
import { Box, Center, Loader, Text } from '@mantine/core'
import { BottomNav, type PageKey } from './components/BottomNav'
import { finishCreatingTransaction, switchMainTab } from './domain/navigation'
import type { Transaction } from './domain/transaction'
import type { MonthlyBudget } from './domain/budget'
import { getTotalSavings, summarizeDisposable, type SavingsBucket, type SavingsMovement } from './domain/savings'
import {
  deleteTransaction,
  ensureGeneralSavingsBucket,
  getPreference,
  listBudgets,
  listSavingsBuckets,
  listSavingsMovements,
  listTransactions,
  setPreference
} from './lib/db'
import { DashboardPage } from './pages/DashboardPage'
import { EditTransactionPage } from './pages/EditTransactionPage'
import { EntryPage } from './pages/EntryPage'
import { MonthTransactionsPage } from './pages/MonthTransactionsPage'
import { TransactionDetailPage } from './pages/TransactionDetailPage'
import { useKeyboardViewportFrame } from './hooks/useKeyboardViewportFrame'
import { FundsPage } from './pages/FundsPage'

const SettingsPage = lazy(async () => {
  const module = await import('./pages/SettingsPage')
  return { default: module.SettingsPage }
})

const StatsPage = lazy(async () => {
  const module = await import('./pages/StatsPage')
  return { default: module.StatsPage }
})

export function App() {
  const { isKeyboardOpen, viewportHeight } = useKeyboardViewportFrame()

  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([])
  const [savingsBuckets, setSavingsBuckets] = useState<SavingsBucket[]>([])
  const [savingsMovements, setSavingsMovements] = useState<SavingsMovement[]>([])
  const [openingDisposableBalance, setOpeningDisposableBalance] = useState(0)
  const [savingsAmountsHidden, setSavingsAmountsHidden] = useState(false)
  const [fundsInitialTab, setFundsInitialTab] = useState<'budget' | 'savings'>('savings')
  const [balanceCardBackground, setBalanceCardBackground] = useState<string | null>(null)
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [viewingTransactionId, setViewingTransactionId] = useState<string | null>(null)
  const [viewingStatsMonth, setViewingStatsMonth] = useState<string | null>(null)

  async function reloadTransactions() {
    setTransactions(await listTransactions())
  }

  async function reloadSavings() {
    await ensureGeneralSavingsBucket()
    const [buckets, movements, openingBalanceText, amountsHiddenText] = await Promise.all([
      listSavingsBuckets(),
      listSavingsMovements(),
      getPreference('opening-disposable-balance'),
      getPreference('savings-amounts-hidden')
    ])
    setSavingsBuckets(buckets)
    setSavingsMovements(movements)
    setOpeningDisposableBalance(Number(openingBalanceText ?? 0))
    setSavingsAmountsHidden(amountsHiddenText === 'true')
  }

  async function reloadBudgets() {
    setBudgets(await listBudgets())
  }

  async function reloadAllData() {
    await Promise.all([
      reloadTransactions(),
      reloadBudgets(),
      reloadSavings(),
      getPreference('balance-card-background').then(setBalanceCardBackground)
    ])
  }

  async function handleOpeningBalanceChange(value: number) {
    await setPreference('opening-disposable-balance', String(value))
    setOpeningDisposableBalance(value)
  }

  async function handleSavingsAmountsHiddenChange(value: boolean) {
    await setPreference('savings-amounts-hidden', String(value))
    setSavingsAmountsHidden(value)
  }

  function openFunds(tab: 'budget' | 'savings') {
    setFundsInitialTab(tab)
    applyNavigationState(switchMainTab('budget'))
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
  const disposableBalance = summarizeDisposable(transactions, savingsMovements, openingDisposableBalance).balance
  const totalSavings = getTotalSavings(savingsMovements, savingsBuckets)

  return (
    <Box
      component="main"
      h={viewportHeight > 0 ? viewportHeight : '100dvh'}
      mih={0}
      bg="var(--book-bg)"
      c="var(--book-text)"
      display="flex"
      style={{ flexDirection: 'column', overflow: 'hidden' }}
    >
      <Box mih={0} flex={1} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
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
                disposableBalance={disposableBalance}
                totalSavings={totalSavings}
                savingsAmountsHidden={savingsAmountsHidden}
                onOpen={setViewingTransactionId}
                onOpenBudget={() => openFunds('budget')}
                onOpenSavings={() => openFunds('savings')}
                onSavingsAmountsHiddenChange={handleSavingsAmountsHiddenChange}
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
            {currentPage === 'budget' && <FundsPage
              key={fundsInitialTab}
              initialTab={fundsInitialTab}
              transactions={transactions}
              budgets={budgets}
              savingsBuckets={savingsBuckets}
              savingsMovements={savingsMovements}
              openingDisposableBalance={openingDisposableBalance}
              amountsHidden={savingsAmountsHidden}
              onBudgetsChanged={reloadBudgets}
              onSavingsChanged={reloadSavings}
              onOpeningBalanceChange={handleOpeningBalanceChange}
              onOpenMonth={(month) => {
                setCurrentPage('stats')
                setViewingStatsMonth(month)
              }}
            />}
            {currentPage === 'stats' && viewingStatsMonth === null && (
              <Suspense fallback={<LoadingPage label="正在加载统计..." />}>
                <StatsPage transactions={transactions} onOpenMonth={setViewingStatsMonth} />
              </Suspense>
            )}
            {currentPage === 'stats' && viewingStatsMonth !== null && (
              <MonthTransactionsPage
                month={viewingStatsMonth}
                transactions={transactions}
                budget={budgets.find((budget) => budget.month === viewingStatsMonth)}
                onBack={() => setViewingStatsMonth(null)}
                onChangeMonth={setViewingStatsMonth}
                onOpen={setViewingTransactionId}
              />
            )}
            {currentPage === 'settings' && (
              <Suspense fallback={<LoadingPage label="正在加载设置..." />}>
                <SettingsPage onChanged={reloadAllData} />
              </Suspense>
            )}
          </>
        )}
      </Box>
      {!isTransactionFormPage && !isKeyboardOpen && (
        <BottomNav
          currentPage={currentPage}
          onChange={(page) => {
            if (page === 'budget') setFundsInitialTab('savings')
            applyNavigationState(switchMainTab(page))
          }}
        />
      )}
    </Box>
  )
}

function LoadingPage({ label }: { label: string }) {
  return <Center h="100%"><Box ta="center"><Loader color="teal" size="sm" /><Text mt="sm" c="dimmed">{label}</Text></Box></Center>
}
