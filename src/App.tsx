import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Box, Center, Flex, Loader, Text } from '@mantine/core'
import { BottomNav, type PageKey } from './components/BottomNav'
import { DashboardPage } from './pages/DashboardPage'
import { EditTransactionPage } from './pages/EditTransactionPage'
import { EntryPage } from './pages/EntryPage'
import { MonthTransactionsPage } from './pages/MonthTransactionsPage'
import { TransactionDetailPage } from './pages/TransactionDetailPage'
import { FundsPage } from './pages/FundsPage'
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt'
import { currentYear } from './lib/dates'
import { getTotalSavings, summarizeDisposable } from './domain/savings'
import type { TransactionScope } from './domain/transaction'
import { useKeyboardViewportFrame } from './hooks/useKeyboardViewportFrame'
import { AppDataProvider, useAppData } from './context/AppDataContext'

const SettingsPage = lazy(async () => ({ default: (await import('./pages/SettingsPage')).SettingsPage }))
const StatsPage = lazy(async () => ({ default: (await import('./pages/StatsPage')).StatsPage }))
const TransactionSearchPage = lazy(async () => ({ default: (await import('./pages/TransactionSearchPage')).TransactionSearchPage }))

export function App() {
  const { isKeyboardOpen, viewportHeight, offsetTop } = useKeyboardViewportFrame()
  return <AppDataProvider><AppFrame isKeyboardOpen={isKeyboardOpen} viewportHeight={viewportHeight} offsetTop={offsetTop} /></AppDataProvider>
}

function AppFrame({ isKeyboardOpen, viewportHeight, offsetTop }: { isKeyboardOpen: boolean; viewportHeight: number; offsetTop: number }) {
  const { initialLoading } = useAppData()
  return <BrowserRouter><Flex component="main" direction="column" h={viewportHeight > 0 ? viewportHeight : '100dvh'} mih={0} bg="var(--book-bg)" c="var(--book-text)" style={{ position: 'fixed', top: offsetTop, right: 0, left: 0, overflow: 'hidden' }}><PwaUpdatePrompt />{initialLoading ? <OpeningPage /> : <AppContent isKeyboardOpen={isKeyboardOpen} viewportHeight={viewportHeight} />}</Flex></BrowserRouter>
}

function AppContent({ isKeyboardOpen, viewportHeight }: { isKeyboardOpen: boolean; viewportHeight: number }) {
  const location = useLocation()
  const navigate = useNavigate()
  const showBottomNav = !isKeyboardOpen && !location.pathname.endsWith('/edit') && location.pathname !== '/entry'
  const currentPage = getCurrentPage(location.pathname)
  return <><Box className="book-app-enter" flex={1} mih={0} style={{ overflowX: 'hidden', overflowY: 'auto' }}><Routes>
    <Route path="/" element={<DashboardRoute />} />
    <Route path="/entry" element={<EntryRoute viewportHeight={viewportHeight} />} />
    <Route path="/funds" element={<FundsRoute />} />
    <Route path="/stats" element={<StatsRoute />} />
    <Route path="/stats/search" element={<TransactionSearchRoute />} />
    <Route path="/stats/month/:month" element={<MonthRoute />} />
    <Route path="/transactions/:id" element={<TransactionDetailRoute />} />
    <Route path="/transactions/:id/edit" element={<EditTransactionRoute viewportHeight={viewportHeight} />} />
    <Route path="/settings" element={<SettingsRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Box>{showBottomNav && <BottomNav currentPage={currentPage} onChange={(page) => navigate(page === 'dashboard' ? '/' : `/${page === 'budget' ? 'funds' : page}`)} />}</>
}

function getCurrentPage(pathname: string): PageKey {
  if (pathname.startsWith('/funds')) return 'budget'
  if (pathname.startsWith('/stats')) return 'stats'
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/entry')) return 'entry'
  return 'dashboard'
}

function DashboardRoute() {
  const navigate = useNavigate(); const data = useAppData()
  const disposableBalance = summarizeDisposable(data.transactions, data.savingsMovements, data.openingDisposableBalance).balance
  return <DashboardPage transactions={data.transactions} budgets={data.budgets} balanceCardBackground={data.balanceCardBackground} disposableBalance={disposableBalance} totalSavings={getTotalSavings(data.savingsMovements, data.savingsBuckets)} savingsAmountsHidden={data.savingsAmountsHidden} onOpen={(id) => navigate(`/transactions/${id}`)} onCreate={() => navigate('/entry')} onOpenBudget={() => navigate('/funds?tab=budget')} onOpenSavings={() => navigate('/funds?tab=savings')} onBalanceCardBackgroundChange={data.handleBalanceCardBackgroundChange} />
}

function EntryRoute({ viewportHeight }: { viewportHeight: number }) {
  const navigate = useNavigate(); const data = useAppData()
  return <EntryPage viewportHeight={viewportHeight} onCancel={() => navigate('/')} onSaved={async () => { await data.reloadTransactions(); navigate('/') }} />
}

function FundsRoute() {
  const [params] = useSearchParams(); const data = useAppData(); const navigate = useNavigate()
  const initialTab = params.get('tab') === 'budget' ? 'budget' : 'savings'
  return <FundsPage key={initialTab} initialTab={initialTab} transactions={data.transactions} budgets={data.budgets} savingsBuckets={data.savingsBuckets} savingsMovements={data.savingsMovements} openingDisposableBalance={data.openingDisposableBalance} amountsHidden={data.savingsAmountsHidden} onBudgetsChanged={data.reloadBudgets} onSavingsChanged={data.reloadSavings} onOpeningBalanceChange={data.handleOpeningBalanceChange} onOpenMonth={(month) => navigate(`/stats/month/${month}`)} />
}

function StatsRoute() {
  const [year, setYear] = useState(currentYear()); const [expenseScope, setExpenseScope] = useState<TransactionScope>('all'); const data = useAppData(); const navigate = useNavigate()
  return <Suspense fallback={<LoadingPage label="正在加载统计..." />}><StatsPage transactions={data.transactions} year={year} expenseScope={expenseScope} onYearChange={setYear} onExpenseScopeChange={setExpenseScope} onOpenMonth={(month) => navigate(`/stats/month/${month}`)} onOpenSearch={() => navigate('/stats/search')} /></Suspense>
}

function TransactionSearchRoute() {
  const [query, setQuery] = useState(''); const [year, setYear] = useState(currentYear()); const [expenseScope, setExpenseScope] = useState<TransactionScope>('all'); const data = useAppData(); const navigate = useNavigate()
  return <Suspense fallback={<LoadingPage label="正在加载搜索..." />}><TransactionSearchPage transactions={data.transactions} query={query} year={year} expenseScope={expenseScope} onQueryChange={setQuery} onYearChange={setYear} onExpenseScopeChange={setExpenseScope} onOpen={(id) => navigate(`/transactions/${id}`)} onBack={() => navigate('/stats')} /></Suspense>
}

function MonthRoute() {
  const { month = '' } = useParams(); const data = useAppData(); const navigate = useNavigate()
  return <MonthTransactionsPage month={month} transactions={data.transactions} budget={data.budgets.find((budget) => budget.month === month)} onBack={() => navigate('/stats')} onChangeMonth={(nextMonth) => navigate(`/stats/month/${nextMonth}`)} onOpen={(id) => navigate(`/transactions/${id}`)} />
}

function TransactionDetailRoute() {
  const { id = '' } = useParams(); const data = useAppData(); const navigate = useNavigate(); const transaction = data.transactions.find((item) => item.id === id)
  if (!transaction) return <NotFoundPage />
  return <TransactionDetailPage transaction={transaction} onBack={() => navigate(-1)} onDeleted={async (transactionId) => { await data.removeTransaction(transactionId); navigate('/') }} onEdit={() => navigate(`/transactions/${id}/edit`)} />
}

function EditTransactionRoute({ viewportHeight }: { viewportHeight: number }) {
  const { id = '' } = useParams(); const data = useAppData(); const navigate = useNavigate(); const transaction = data.transactions.find((item) => item.id === id)
  if (!transaction) return <NotFoundPage />
  return <EditTransactionPage transaction={transaction} viewportHeight={viewportHeight} onCancel={() => navigate(-1)} onSaved={async () => { await data.reloadTransactions(); navigate(`/transactions/${id}`) }} />
}

function SettingsRoute() {
  const data = useAppData()
  return <Suspense fallback={<LoadingPage label="正在加载设置..." />}><SettingsPage onChanged={data.reloadAllData} /></Suspense>
}

function OpeningPage() { return <div className="app-boot" role="status" aria-label="记账本正在启动"><div className="app-boot__mark" aria-hidden="true">账</div><div className="app-boot__title">记账本</div></div> }
function LoadingPage({ label }: { label: string }) { return <Center h="100%"><Box ta="center"><Loader color="teal" size="sm" /><Text mt="sm" c="dimmed">{label}</Text></Box></Center> }
function NotFoundPage() { return <Center h="100%"><Text c="dimmed">找不到这笔账单</Text></Center> }
