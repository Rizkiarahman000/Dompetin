import { useMemo, useState } from 'react'
import { BarChart3, Flame, Leaf } from 'lucide-react'
import ExpenseDetailModal from './ExpenseDetailModal'
import { useCategories } from '../context/CategoriesContext'
import { buildExpenseBuckets, PERIOD_LABEL } from '../utils/expenseBuckets'
import { formatRupiah } from '../utils/format'

const MODES = [
  { id: 'day', label: 'Harian' },
  { id: 'week', label: 'Mingguan' },
  { id: 'month', label: 'Bulanan' },
]

export default function ExpenseChart({ transactions }) {
  const { resolve } = useCategories()
  const [mode, setMode] = useState('day')
  const [selected, setSelected] = useState(null)

  const buckets = useMemo(
    () => buildExpenseBuckets(transactions, mode),
    [transactions, mode],
  )

  const max = useMemo(() => buckets.reduce((m, b) => Math.max(m, b.total), 0), [buckets])
  const nonZero = useMemo(() => buckets.filter((b) => b.total > 0), [buckets])
  const total = buckets.reduce((s, b) => s + b.total, 0)
  // Rata-rata per periode (termasuk periode tanpa pengeluaran).
  const avg = buckets.length ? total / buckets.length : 0
  const spender = nonZero.length
    ? nonZero.reduce((a, b) => (b.total > a.total ? b : a))
    : null
  // "Paling hemat" diambil dari periode yang ada pengeluarannya, selain yang paling boros.
  const saverPool = nonZero.filter((b) => b.key !== spender?.key)
  const saver = saverPool.length
    ? saverPool.reduce((a, b) => (b.total < a.total ? b : a))
    : null

  const switchMode = (next) => {
    setMode(next)
    setSelected(null)
  }

  return (
    <section className="panel chart-card">
      <header className="panel-head chart-head">
        <h2 className="panel-title">
          <BarChart3 size={16} /> Grafik pengeluaran
        </h2>
        <div className="segmented" role="group" aria-label="Rentang grafik pengeluaran">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`segmented-item${mode === m.id ? ' is-active' : ''}`}
              onClick={() => switchMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="chart-summary">
        <div className="chart-summary-item">
          <span>Total</span>
          <strong>{formatRupiah(total)}</strong>
        </div>
        <div className="chart-summary-item">
          <span>Rata-rata / {PERIOD_LABEL[mode]}</span>
          <strong>{formatRupiah(avg)}</strong>
        </div>
        <div className="chart-summary-item is-boros">
          <span>
            <Flame size={13} /> Paling boros
          </span>
          <strong>{spender ? formatRupiah(spender.total) : '—'}</strong>
          <small>{spender ? spender.title : 'belum ada data'}</small>
        </div>
        <div className="chart-summary-item is-hemat">
          <span>
            <Leaf size={13} /> Paling hemat
          </span>
          <strong>{saver ? formatRupiah(saver.total) : '—'}</strong>
          <small>{saver ? saver.title : 'belum ada pembanding'}</small>
        </div>
      </div>

      <div className="chart">
        <div className="chart-plot">
          {avg > 0 && max > 0 && (
            <span
              className="chart-avg"
              style={{ bottom: `${Math.min(100, (avg / max) * 100)}%` }}
            />
          )}
          <div className="chart-bars">
            {buckets.map((b) => {
              const h =
                max > 0
                  ? Math.max(b.total > 0 ? 6 : 2, Math.round((b.total / max) * 100))
                  : 2
              const isBoros = b.total > 0 && b.total >= avg
              const isHemat = b.total > 0 && b.total < avg
              return (
                <button
                  key={b.key}
                  type="button"
                  className={`chart-col${selected?.key === b.key ? ' is-active' : ''}${
                    isBoros ? ' is-boros' : ''
                  }${isHemat ? ' is-hemat' : ''}`}
                  onClick={() => setSelected(b)}
                  title={`${b.title} · ${formatRupiah(b.total)}`}
                  aria-label={`${b.title}, pengeluaran ${formatRupiah(b.total)}`}
                >
                  {b.total > 0 ? (
                    <span className="chart-stack" style={{ height: `${h}%` }}>
                      {(b.byCategory || []).map((g) => {
                        const meta = resolve('expense', g.id)
                        return (
                          <span
                            key={g.id}
                            className="chart-seg"
                            style={{ height: `${g.pct}%`, background: meta.color }}
                            title={`${meta.label}: ${formatRupiah(g.amount)} (${Math.round(
                              g.pct,
                            )}%)`}
                          />
                        )
                      })}
                    </span>
                  ) : (
                    <span className="chart-stub" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="chart-labels">
          {buckets.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`chart-label${selected?.key === b.key ? ' is-active' : ''}`}
              onClick={() => setSelected(b)}
            >
              <span>{b.label}</span>
              <small>{b.sublabel}</small>
            </button>
          ))}
        </div>
      </div>

      {total === 0 && (
        <p className="chart-empty">Belum ada pengeluaran pada rentang ini.</p>
      )}

      <ExpenseDetailModal bucket={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
