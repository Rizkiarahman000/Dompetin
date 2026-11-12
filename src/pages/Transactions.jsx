import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import TransactionRow from '../components/TransactionRow'
import TransactionModal from '../components/TransactionModal'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import { findCategory } from '../utils/categories'
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
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Dibuka otomatis saat pengguna menekan tombol "Catat transaksi" global.
  useEffect(() => {
    if (addIntent) {
      setEditing(null)
      setModalOpen(true)
      onAddIntentHandled?.()
    }
  }, [addIntent, onAddIntentHandled])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = transactions
      .filter((t) => filter === 'all' || t.type === filter)
      .filter((t) => {
        if (!q) return true
        const cat = findCategory(t.type, t.category).label.toLowerCase()
        return (t.note || '').toLowerCase().includes(q) || cat.includes(q)
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

    const map = new Map()
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, [])
      map.get(t.date).push(t)
    }
    return [...map.entries()]
  }, [transactions, filter, query])

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
      notify('Transaksi diperbarui.')
    } else {
      addTransaction(data)
      notify('Transaksi ditambahkan.')
    }
    closeModal()
  }

  const handleDelete = () => {
    if (!deleting) return
    deleteTransaction(deleting.id)
    setDeleting(null)
    notify('Transaksi dihapus.')
  }

  return (
    <div className="page">
      <section className="page-head">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-sub">
            {totalShown} catatan
            {filter !== 'all' ? ` · ${filter === 'income' ? 'pemasukan' : 'pengeluaran'}` : ''}
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
            aria-label="Cari transaksi"
          />
        </label>
        <div className="segmented" role="group" aria-label="Filter jenis transaksi">
          {[
            ['all', 'Semua'],
            ['income', 'Masuk'],
            ['expense', 'Keluar'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`segmented-item${filter === id ? ' is-active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada hasil'}
          text={
            transactions.length === 0
              ? 'Yuk catat transaksi pertamamu — pemasukan atau pengeluaran.'
              : 'Coba ubah kata kunci atau filter jenis transaksi.'
          }
          action={
            transactions.length === 0 ? (
              <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}>
                <Plus size={15} /> Tambah transaksi
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
        title="Hapus transaksi?"
        message={`"${deleting?.note || 'Transaksi ini'}" akan dihapus permanen dari perangkatmu.`}
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
