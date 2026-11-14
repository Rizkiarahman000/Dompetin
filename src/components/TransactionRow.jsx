import { Pencil, Trash2 } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import { useCategories } from '../context/CategoriesContext'
import { formatRupiah, relativeDate } from '../utils/format'

export default function TransactionRow({ tx, onEdit, onDelete, compact = false }) {
  const { resolve } = useCategories()
  const cat = resolve('expense', tx.category)

  return (
    <li className={`tx-row${compact ? ' tx-row--compact' : ''}`}>
      <span className="tx-icon" style={{ '--cat': cat.color }}>
        <CategoryIcon name={cat.icon} size={18} />
      </span>

      <div className="tx-main">
        <strong className="tx-title">{tx.note || cat.label}</strong>
        <span className="tx-meta">
          <span>{cat.label}</span>
          <span className="dot" aria-hidden="true" />
          <span>{relativeDate(tx.date)}</span>
        </span>
      </div>

      <span className="tx-amount tx-amount--expense">− {formatRupiah(tx.amount)}</span>

      {!compact && (onEdit || onDelete) && (
        <div className="tx-actions">
          {onEdit && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit(tx)}
              title="Ubah"
              aria-label={`Ubah pengeluaran ${tx.note || cat.label}`}
            >
              <Pencil size={15} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => onDelete(tx)}
              title="Hapus"
              aria-label={`Hapus pengeluaran ${tx.note || cat.label}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
