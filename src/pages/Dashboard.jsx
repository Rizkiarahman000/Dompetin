import { useMemo } from 'react'
import {
  Plus,
  ChevronRight,
  Wallet,
  CalendarDays,
  TrendingDown,
  Tag,
} from 'lucide-react'
import TransactionRow from '../components/TransactionRow'
import EmptyState from '../components/EmptyState'
import ExpenseChart from '../components/ExpenseChart'
import { useCategories } from '../context/CategoriesContext'
import { formatRupiah, formatCompact, monthLabel } from '../utils/format'

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 19) return 'Selamat sore'
  return 'Selamat malam'
}

export default function Dashboard({ transactions, stats, onNavigate, onAdd }) {
  const { resolve } = useCategories()

  const recent = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [transactions],
  )

  const breakdown = useMemo(() => {
    const entries = Object.entries(stats.byCategory)
      .map(([id, amount]) => ({ ...resolve('expense', id), amount }))
      .sort((a, b) => b.amount - a.amount)
    const total = entries.reduce((sum, e) => sum + e.amount, 0)
    return { entries, total }
  }, [stats.byCategory, resolve])

  const topCategory = breakdown.entries[0] || null
  const daysElapsed = new Date().getDate()
  const avgPerDay = stats.monthExpense / (daysElapsed || 1)

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{greeting()} 👋</span>
          <h1 className="hero-title">Halo, Rizkia</h1>
          <p className="hero-sub">
            Catat tiap pengeluaran supaya kamu tahu ke mana uangmu pergi.
          </p>
          <button type="button" className="btn btn--primary" onClick={onAdd}>
            <Plus size={17} /> Catat pengeluaran
          </button>
        </div>

        <div className="balance-card">
          <div className="balance-top">
            <span className="balance-label">
              <Wallet size={15} /> Pengeluaran bulan ini
            </span>
            <span className="balance-month">{monthLabel(stats.thisMonth)}</span>
          </div>
          <strong className="balance-value">{formatRupiah(stats.monthExpense)}</strong>
          <div className="balance-split">
            <span className="balance-chip balance-chip--out">
              <CalendarDays size={14} /> Hari ini {formatRupiah(stats.todayExpense)}
            </span>
            <span className="balance-chip">
              <Wallet size={14} /> Total {formatRupiah(stats.expense)}
            </span>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-ico stat-ico--out">
            <TrendingDown size={18} />
          </span>
          <div>
            <span className="stat-label">Rata-rata / hari (bulan ini)</span>
            <strong>{formatRupiah(avgPerDay)}</strong>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-ico stat-ico--neutral">
            <Tag size={18} />
          </span>
          <div>
            <span className="stat-label">Kategori terboros</span>
            <strong>{topCategory ? topCategory.label : '—'}</strong>
            {topCategory && (
              <small className="stat-sub">{formatRupiah(topCategory.amount)}</small>
            )}
          </div>
        </article>
      </section>

      <ExpenseChart transactions={transactions} />

      <div className="cols">
        <section className="panel">
          <header className="panel-head">
            <h2 className="panel-title">Pengeluaran terbaru</h2>
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('transactions')}
            >
              Lihat semua <ChevronRight size={15} />
            </button>
          </header>

          {recent.length === 0 ? (
            <EmptyState
              title="Belum ada pengeluaran"
              text="Mulai catat pengeluaran pertamamu."
              action={
                <button type="button" className="btn btn--primary btn--sm" onClick={onAdd}>
                  <Plus size={15} /> Catat sekarang
                </button>
              }
            />
          ) : (
            <ul className="tx-list">
              {recent.map((t) => (
                <TransactionRow key={t.id} tx={t} compact />
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel-head">
            <h2 className="panel-title">Pengeluaran per kategori</h2>
          </header>

          {breakdown.entries.length === 0 ? (
            <EmptyState
              title="Belum ada pengeluaran"
              text="Grafik muncul otomatis setelah kamu mencatat pengeluaran bulan ini."
            />
          ) : (
            <ul className="breakdown">
              {breakdown.entries.map((e) => (
                <li key={e.id} className="breakdown-row">
                  <div className="breakdown-head">
                    <span className="breakdown-name">{e.label}</span>
                    <span className="breakdown-val">{formatCompact(e.amount)}</span>
                  </div>
                  <div className="bar">
                    <span
                      style={{
                        width: `${Math.round((e.amount / breakdown.total) * 100)}%`,
                        background: e.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
