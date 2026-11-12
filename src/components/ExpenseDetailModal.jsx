import { X } from 'lucide-react'
import TransactionRow from './TransactionRow'
import { useCategories } from '../context/CategoriesContext'
import { formatRupiah } from '../utils/format'

export default function ExpenseDetailModal({ bucket, onClose }) {
  const { resolve } = useCategories()
  const items = bucket?.items || []
  const total = bucket?.total || 0

  const map = new Map()
  for (const t of items) {
    map.set(t.category, (map.get(t.category) || 0) + (Number(t.amount) || 0))
  }
  const groups = [...map.entries()]
    .map(([id, amount]) => {
      const meta = resolve('expense', id)
      return {
        id,
        amount,
        label: meta.label,
        color: meta.color,
        pct: total > 0 ? (amount / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  if (!bucket) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Pengeluaran ${bucket.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Pengeluaran</h3>
            <p className="modal-text">{bucket.title}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="detail-total">
          <span>Total</span>
          <strong>{formatRupiah(bucket.total)}</strong>
        </div>

        {groups.length > 0 && (
          <div className="detail-cats">
            <h4 className="detail-cats-title">Per kategori</h4>
            <ul className="chart-cat-legend">
              {groups.map((g) => (
                <li key={g.id} className="chart-cat-row">
                  <span className="chart-cat-dot" style={{ background: g.color }} />
                  <span className="chart-cat-name">{g.label}</span>
                  <span className="chart-cat-amount">{formatRupiah(g.amount)}</span>
                  <span className="chart-cat-pct">{Math.round(g.pct)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length === 0 ? (
          <p className="detail-empty">Tidak ada pengeluaran pada periode ini.</p>
        ) : (
          <ul className="tx-list">
            {items.map((t) => (
              <TransactionRow key={t.id} tx={t} compact />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
