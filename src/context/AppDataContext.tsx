import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Transaction } from '../domain/transaction'
import type { MonthlyBudget } from '../domain/budget'
import { deleteTransaction, ensureGeneralSavingsBucket, getPreference, listBudgets, listSavingsBuckets, listSavingsMovements, listTransactions, setPreference } from '../lib/db'
import type { SavingsBucket, SavingsMovement } from '../domain/savings'

type AppDataContextValue = {
  transactions: Transaction[]
  budgets: MonthlyBudget[]
  savingsBuckets: SavingsBucket[]
  savingsMovements: SavingsMovement[]
  openingDisposableBalance: number
  savingsAmountsHidden: boolean
  balanceCardBackground: string | null
  initialLoading: boolean
  reloadTransactions: () => Promise<void>
  reloadBudgets: () => Promise<void>
  reloadSavings: () => Promise<void>
  reloadAllData: () => Promise<void>
  handleOpeningBalanceChange: (value: number) => Promise<void>
  handleBalanceCardBackgroundChange: (value: string | null) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([])
  const [savingsBuckets, setSavingsBuckets] = useState<SavingsBucket[]>([])
  const [savingsMovements, setSavingsMovements] = useState<SavingsMovement[]>([])
  const [openingDisposableBalance, setOpeningDisposableBalance] = useState(0)
  const [savingsAmountsHidden, setSavingsAmountsHidden] = useState(false)
  const [balanceCardBackground, setBalanceCardBackground] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  async function reloadTransactions() { setTransactions(await listTransactions()) }

  async function reloadSavings() {
    await ensureGeneralSavingsBucket()
    const [buckets, movements, openingBalanceText, amountsHiddenText] = await Promise.all([
      listSavingsBuckets(), listSavingsMovements(), getPreference('opening-disposable-balance'), getPreference('savings-amounts-hidden')
    ])
    setSavingsBuckets(buckets)
    setSavingsMovements(movements)
    setOpeningDisposableBalance(Number(openingBalanceText ?? 0))
    setSavingsAmountsHidden(amountsHiddenText === 'true')
  }

  async function reloadBudgets() { setBudgets(await listBudgets()) }

  async function reloadAllData() {
    await Promise.all([reloadTransactions(), reloadBudgets(), reloadSavings(), getPreference('balance-card-background').then(setBalanceCardBackground)])
  }

  async function handleOpeningBalanceChange(value: number) {
    await setPreference('opening-disposable-balance', String(value))
    setOpeningDisposableBalance(value)
  }

  async function handleBalanceCardBackgroundChange(value: string | null) {
    await setPreference('balance-card-background', value)
    setBalanceCardBackground(value)
  }

  async function removeTransaction(id: string) {
    await deleteTransaction(id)
    await reloadTransactions()
  }

  useEffect(() => {
    let active = true
    const minimumOpeningTime = new Promise((resolve) => window.setTimeout(resolve, 500))
    void Promise.allSettled([reloadAllData(), minimumOpeningTime]).then(() => { if (active) setInitialLoading(false) })
    return () => { active = false }
  }, [])

  return <AppDataContext.Provider value={{ transactions, budgets, savingsBuckets, savingsMovements, openingDisposableBalance, savingsAmountsHidden, balanceCardBackground, initialLoading, reloadTransactions, reloadBudgets, reloadSavings, reloadAllData, handleOpeningBalanceChange, handleBalanceCardBackgroundChange, removeTransaction }}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData must be used inside AppDataProvider')
  return value
}
