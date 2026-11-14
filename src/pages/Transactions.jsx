import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import TransactionRow from '../components/TransactionRow'
import TransactionModal from '../components/TransactionModal'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import { useCategories } from '../context/CategoriesContext'
import { formatDate, relativeDate } from '../utils/format'

export default function Transactions({
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  notify,
  addIntent,
  onAddIntentHandled,
}) {
  const { resolve, allFor } = useCategories()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Dibuka otomatis saat pengguna menekan tombol "Catat pengeluaran" global.
  useEffect(() => {
    if (addIntent) {
      setEditing(null)
      setModalOpen(true)
      onAddIntentHandled?.()
    }
  }, [addIntent, onAddIntentHandled])

  const categories = allFor('expense')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = transactions
      .filter((t) => t.type === 'expense')
      .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
      .filter((t) => {
        if (!q) return true
        const cat = resolve('expense', t.category).label.toLowerCase()
        return (t.note || '').toLowerCase().includes(q) || cat.includes(q)
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

    const map = new Map()
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, [])
      map.get(t.date).push(t)
    }
    return [...map.entries()]
  }, [transactions, categoryFilter, query, resolve])

  const totalShown = groups.reduce((sum, [, items]) => sum + items.length, 0)

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (tx) => {
    setEditing(tx)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleSubmit = (data) => {
    if (editing) {
      updateTransaction(editing.id, data)
      notify('Pengeluaran diperbarui.')
    } else {
      addTransaction(data)
      notify('Pengeluaran ditambahkan.')
    }
    closeModal()
  }

  const handleDelete = () => {
    if (!deleting) return
    deleteTransaction(deleting.id)
    setDeleting(null)
    notify('Pengeluaran dihapus.')
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1 className="page-title">Pengeluaran</h1>
          <p className="page-sub">
            {totalShown} catatan
            {categoryFilter !== 'all'
              ? ` · ${resolve('expense', categoryFilter).label}`
              : ''}
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openAdd}>
          <Plus size={17} /> Tambah
        </button>
      </section>

      <div className="toolbar">
        <label className="search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari catatan atau kategori…"
            aria-label="Cari pengeluaran"
          />
        </label>
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter kategori"
        >
          <option value="all">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={transactions.length === 0 ? 'Belum ada pengeluaran' : 'Tidak ada hasil'}
          text={
            transactions.length === 0
              ? 'Yuk catat pengeluaran pertamamu.'
              : 'Coba ubah kata kunci atau filter kategori.'
          }
          action={
            transactions.length === 0 ? (
              <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}>
                <Plus size={15} /> Tambah pengeluaran
              </button>
            ) : null
          }
        />
      ) : (
        <div className="tx-groups">
          {groups.map(([date, items]) => (
            <section key={date} className="tx-group">
              <h2 className="tx-group-date">
                {relativeDate(date)} <span>{formatDate(date)}</span>
              </h2>
              <ul className="tx-list">
                {items.map((t) => (
                  <TransactionRow
                    key={t.id}
                    tx={t}
                    onEdit={openEdit}
                    onDelete={setDeleting}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <TransactionModal
        open={modalOpen}
        initial={editing}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        title="Hapus pengeluaran?"
        message={`"${deleting?.note || 'Pengeluaran ini'}" akan dihapus permanen dari perangkatmu.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
