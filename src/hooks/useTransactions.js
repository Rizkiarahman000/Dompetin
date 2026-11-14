import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import transactionService from '../services/transactionService'
import { readStore, writeStore } from '../utils/storage'
import { currentMonthKey, monthKey, todayISO } from '../utils/format'

// ---------------------------------------------------------------------------
// useTransactions — sumber data tunggal untuk seluruh aplikasi.
//
// Sumber data utama: Supabase (tabel public.transactions) via PostgREST.
// Supaya PWA tetap "hidup" saat offline, hasil query di-cache ke localStorage
// dan setiap perubahan langsung diterapkan ke cache (optimistic update).
// Perubahan yang belum sempat terkirim masuk ke antrean (sync queue) dan
// otomatis dikirim saat koneksi kembali online.
// ---------------------------------------------------------------------------

const CACHE_KEY = 'cache.transactions'
const QUEUE_KEY = 'sync.queue'

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'tx-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function toPayload(t) {
  return {
    id: t.id,
    type: t.type,
    amount: Math.abs(Number(t.amount) || 0),
    category: t.category,
    note: (t.note || '').trim(),
    date: t.date || todayISO(),
  }
}

function loadQueue() {
  const q = readStore(QUEUE_KEY, null)
  if (q && typeof q === 'object') {
    return {
      upserts: q.upserts && typeof q.upserts === 'object' ? q.upserts : {},
      deletes: Array.isArray(q.deletes) ? q.deletes : [],
    }
  }
  return { upserts: {}, deletes: [] }
}

function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    const cached = readStore(CACHE_KEY, [])
    return Array.isArray(cached) ? cached : []
  })
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(isOnline)

  const txRef = useRef(transactions)
  const queueRef = useRef(loadQueue())

  const commit = useCallback((next) => {
    txRef.current = next
    setTransactions(next)
    writeStore(CACHE_KEY, next)
  }, [])

  const saveQueue = useCallback(() => {
    writeStore(QUEUE_KEY, queueRef.current)
  }, [])

  const enqueueUpsert = useCallback(
    (row) => {
      const q = queueRef.current
      q.upserts[row.id] = toPayload(row)
      q.deletes = q.deletes.filter((id) => id !== row.id)
      saveQueue()
    },
    [saveQueue],
  )

  const enqueueDelete = useCallback(
    (id) => {
      const q = queueRef.current
      delete q.upserts[id]
      if (!q.deletes.includes(id)) q.deletes.push(id)
      saveQueue()
    },
    [saveQueue],
  )

  const flushQueue = useCallback(async () => {
    if (!isOnline()) return false
    const q = queueRef.current

    for (const id of [...q.deletes]) {
      await transactionService.remove(id)
      q.deletes = q.deletes.filter((x) => x !== id)
      saveQueue()
    }

    const rows = Object.values(q.upserts)
    if (rows.length > 0) {
      await transactionService.upsertMany(rows)
      for (const row of rows) delete q.upserts[row.id]
      saveQueue()
    }

    return true
  }, [saveQueue])

  const refresh = useCallback(async () => {
    if (!isOnline()) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      await flushQueue()
      const rows = await transactionService.list()
      commit(rows)
    } catch {
      // Server tidak terjangkau — biarkan cache lokal tetap tampil.
    } finally {
      setLoading(false)
    }
  }, [commit, flushQueue])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      refresh()
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refresh])

  const sync = useCallback(() => {
    flushQueue().catch(() => {
      // Gagal kirim (offline) — perubahan tetap di antrean untuk dicoba lagi.
    })
  }, [flushQueue])

  const addTransaction = useCallback(
    (data) => {
      const row = {
        id: uid(),
        type: 'expense',
        amount: Math.abs(Number(data.amount) || 0),
        category: data.category,
        note: (data.note || '').trim(),
        date: data.date || todayISO(),
        createdAt: new Date().toISOString(),
      }
      commit([row, ...txRef.current])
      enqueueUpsert(row)
      sync()
      return row
    },
    [commit, enqueueUpsert, sync],
  )

  const updateTransaction = useCallback(
    (id, data) => {
      const current = txRef.current.find((t) => t.id === id)
      if (!current) return
      const updated = {
        ...current,
        type: data.type ?? current.type,
        amount: data.amount != null ? Math.abs(Number(data.amount) || 0) : current.amount,
        category: data.category ?? current.category,
        note: data.note != null ? data.note.trim() : current.note,
        date: data.date ?? current.date,
      }
      commit(txRef.current.map((t) => (t.id === id ? updated : t)))
      enqueueUpsert(updated)
      sync()
    },
    [commit, enqueueUpsert, sync],
  )

  const deleteTransaction = useCallback(
    (id) => {
      commit(txRef.current.filter((t) => t.id !== id))
      enqueueDelete(id)
      sync()
    },
    [commit, enqueueDelete, sync],
  )

  const resetAll = useCallback(() => {
    const ids = txRef.current.map((t) => t.id)
    commit([])
    queueRef.current.upserts = {}
    ids.forEach((id) => enqueueDelete(id))
    saveQueue()
    if (isOnline()) {
      transactionService.removeAll().catch(() => {})
    }
    sync()
  }, [commit, enqueueDelete, saveQueue, sync])

  const stats = useMemo(() => {
    const thisMonth = currentMonthKey()
    const today = todayISO()
    let expense = 0
    let monthExpense = 0
    let todayExpense = 0
    let count = 0
    const byCategory = {}

    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const amount = Number(t.amount) || 0
      expense += amount
      count += 1

      if (t.date === today) todayExpense += amount

      if (monthKey(t.date) === thisMonth) {
        monthExpense += amount
        byCategory[t.category] = (byCategory[t.category] || 0) + amount
      }
    }

    return {
      expense,
      monthExpense,
      todayExpense,
      count,
      byCategory,
      thisMonth,
    }
  }, [transactions])

  return {
    transactions,
    loading,
    online,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetAll,
    stats,
  }
}

export default useTransactions
