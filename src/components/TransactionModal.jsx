import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, X, Check } from 'lucide-react'
import { categoriesFor } from '../utils/categories'
import { useCategories } from '../context/CategoriesContext'
import { formatRupiah, todayISO } from '../utils/format'

function blankForm() {
  return {
    type: 'expense',
    amount: '',
    category: categoriesFor('expense')[0].id,
    note: '',
    date: todayISO(),
  }
}

/**
 * Modal form untuk menambah / mengubah transaksi (bagian dari CRUD).
 */
export default function TransactionModal({ open, initial, onClose, onSubmit }) {
  const { allFor } = useCategories()
  const [form, setForm] = useState(blankForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        type: initial.type,
        amount: String(initial.amount ?? ''),
        category: initial.category,
        note: initial.note || '',
        date: initial.date || todayISO(),
      })
    } else {
      setForm(blankForm())
    }
    setError('')
  }, [open, initial])

  if (!open) return null

  const categories = allFor(form.type)

  const switchType = (type) => {
    const nextCats = allFor(type)
    setForm((f) => ({
      ...f,
      type,
      category: nextCats.some((c) => c.id === f.category) ? f.category : nextCats[0].id,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!amount || amount <= 0) {
      setError('Nominal harus lebih dari 0.')
      return
    }
    if (!form.date) {
      setError('Tanggal wajib diisi.')
      return
    }
    onSubmit({
      type: form.type,
      amount,
      category: form.category,
      note: form.note,
      date: form.date,
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Ubah transaksi' : 'Tambah transaksi'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 className="modal-title">{initial ? 'Ubah transaksi' : 'Catat transaksi'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form className="tx-form" onSubmit={handleSubmit}>
          <div className="type-switch" role="group" aria-label="Jenis transaksi">
            <button
              type="button"
              className={`type-switch-btn${form.type === 'expense' ? ' is-active is-expense' : ''}`}
              onClick={() => switchType('expense')}
            >
              <ArrowUpRight size={16} /> Pengeluaran
            </button>
            <button
              type="button"
              className={`type-switch-btn${form.type === 'income' ? ' is-active is-income' : ''}`}
              onClick={() => switchType('income')}
            >
              <ArrowDownLeft size={16} /> Pemasukan
            </button>
          </div>

          <label className="field">
            <span className="field-label">Nominal</span>
            <div className="amount-input">
              <span className="amount-prefix">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1000"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                autoFocus
              />
            </div>
            {Number(form.amount) > 0 && (
              <span className="field-hint">{formatRupiah(form.amount)}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Kategori</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Catatan</span>
            <input
              type="text"
              placeholder={form.type === 'income' ? 'mis. Uang saku bulanan' : 'mis. Makan siang kampus'}
              maxLength={80}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field-label">Tanggal</span>
            <input
              type="date"
              value={form.date}
              max={todayISO()}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn--primary">
              <Check size={16} /> {initial ? 'Simpan perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
