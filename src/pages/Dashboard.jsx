import { useMemo } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  Wallet,
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
      [...transactions]
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

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{greeting()} 👋</span>
          <h1 className="hero-title">Halo, Rizkia</h1>
          <p className="hero-sub">
            Ini ringkasan keuanganmu. Catat tiap rupiah supaya dompet tetap waras.
          </p>
          <button type="button" className="btn btn--primary" onClick={onAdd}>
            <Plus size={17} /> Catat transaksi
          </button>
        </div>

        <div className="balance-card">
          <div className="balance-top">
            <span className="balance-label">
              <Wallet size={15} /> Saldo saat ini
            </span>
            <span className="balance-month">{monthLabel(stats.thisMonth)}</span>
          </div>
          <strong className="balance-value">{formatRupiah(stats.balance)}</strong>
          <div className="balance-split">
            <span className="balance-chip balance-chip--in">
              <ArrowDownLeft size={14} /> {formatRupiah(stats.monthIncome)}
            </span>
            <span className="balance-chip balance-chip--out">
              <ArrowUpRight size={14} /> {formatRupiah(stats.monthExpense)}
            </span>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-ico stat-ico--in">
            <TrendingUp size={18} />
          </span>
          <div>
            <span className="stat-label">Pemasukan bulan ini</span>
            <strong>{formatRupiah(stats.monthIncome)}</strong>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-ico stat-ico--out">
            <TrendingDown size={18} />
          </span>
          <div>
            <span className="stat-label">Pengeluaran bulan ini</span>
            <strong>{formatRupiah(stats.monthExpense)}</strong>
          </div>
        </article>
      </section>

      <ExpenseChart transactions={transactions} />

      <div className="cols">
        <section className="panel">
          <header className="panel-head">
            <h2 className="panel-title">Transaksi terbaru</h2>
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
              title="Belum ada transaksi"
              text="Mulai catat pemasukan atau pengeluaran pertamamu."
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
