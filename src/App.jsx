import { useCallback, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import Footer from './components/Footer'
import PWABadge from './components/PWABadge'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import { useTransactions } from './hooks/useTransactions'

export default function App() {
  const [tab, setTab] = useState('home')
  const [toast, setToast] = useState(null)
  const [addIntent, setAddIntent] = useState(false)
  const timerRef = useRef(null)

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetAll,
    stats,
  } = useTransactions()

  const notify = useCallback((message) => {
    setToast(message)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const navigate = useCallback((next) => {
    setTab(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openAdd = useCallback(() => {
    setTab('transactions')
    setAddIntent(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleAddIntent = useCallback(() => setAddIntent(false), [])

  return (
    <div className="app">
      <Header tab={tab} onNavigate={navigate} />

      <main className="main container">
        {tab === 'home' && (
          <Dashboard
            transactions={transactions}
            stats={stats}
            onNavigate={navigate}
            onAdd={openAdd}
          />
        )}

        {tab === 'transactions' && (
          <Transactions
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction}
            notify={notify}
            addIntent={addIntent}
            onAddIntentHandled={handleAddIntent}
          />
        )}

        {tab === 'profile' && (
          <Profile stats={stats} onReset={resetAll} notify={notify} />
        )}
      </main>

      <Footer />
      <TabBar tab={tab} onNavigate={navigate} />
      <PWABadge />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  )
}
