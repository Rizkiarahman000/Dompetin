import { useCallback, useEffect, useRef, useState } from 'react'
import categoryService from '../services/categoryService'
import { readStore, writeStore } from '../utils/storage'
import { categoriesFor } from '../utils/categories'

// ---------------------------------------------------------------------------
// useCategoriesStore — kategori bawaan (statis) + kategori kustom dari
// Supabase. Kategori kustom di-cache lokal dan punya antrean sinkronisasi,
// sama seperti transaksi, supaya tetap bisa dikelola saat offline.
// ---------------------------------------------------------------------------

const CACHE_KEY = 'cache.categories'
const QUEUE_KEY = 'sync.categories'

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'cat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function toPayload(c) {
  return { id: c.id, type: c.type, label: c.label, icon: c.icon, color: c.color }
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

export function useCategoriesStore() {
  const [custom, setCustom] = useState(() => {
    const cached = readStore(CACHE_KEY, [])
    return Array.isArray(cached) ? cached : []
  })
  const [loading, setLoading] = useState(true)
  const ref = useRef(custom)
  const queueRef = useRef(loadQueue())

  const commit = useCallback((next) => {
    ref.current = next
    setCustom(next)
    writeStore(CACHE_KEY, next)
  }, [])

  const saveQueue = useCallback(() => writeStore(QUEUE_KEY, queueRef.current), [])

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
      await categoryService.remove(id)
      q.deletes = q.deletes.filter((x) => x !== id)
      saveQueue()
    }

    const rows = Object.values(q.upserts)
    if (rows.length > 0) {
      await categoryService.upsertMany(rows)
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
      const rows = await categoryService.list()
      commit(rows)
    } catch {
      // Biarkan cache lokal tetap dipakai.
    } finally {
      setLoading(false)
    }
  }, [commit, flushQueue])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handleOnline = () => refresh()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refresh])

  const sync = useCallback(() => {
    flushQueue().catch(() => {})
  }, [flushQueue])

  const addCategory = useCallback(
    (data) => {
      const label = (data.label || '').trim()
      if (!label) return null
      const row = {
        id: uid(),
        type: data.type === 'income' ? 'income' : 'expense',
        label,
        icon: data.icon || 'Tag',
        color: data.color || '#868e96',
        createdAt: new Date().toISOString(),
      }
      commit([...ref.current, row])
      enqueueUpsert(row)
      sync()
      return row
    },
    [commit, enqueueUpsert, sync],
  )

  const removeCategory = useCallback(
    (id) => {
      commit(ref.current.filter((c) => c.id !== id))
      enqueueDelete(id)
      sync()
    },
    [commit, enqueueDelete, sync],
  )

  const updateCategory = useCallback(
    (id, data) => {
      const current = ref.current.find((c) => c.id === id)
      if (!current) return null
      const updated = {
        ...current,
        label: (data.label ?? current.label).trim(),
        icon: data.icon ?? current.icon,
        color: data.color ?? current.color,
      }
      commit(ref.current.map((c) => (c.id === id ? updated : c)))
      enqueueUpsert(updated)
      sync()
      return updated
    },
    [commit, enqueueUpsert, sync],
  )

  // Daftar gabungan (bawaan + kustom) untuk satu jenis transaksi.
  const allFor = useCallback(
    (type) => {
      const defaults = categoriesFor(type).map((c) => ({ ...c, isCustom: false }))
      const extras = custom
        .filter((c) => c.type === type)
        .map((c) => ({ ...c, isCustom: true }))
      return [...defaults, ...extras]
    },
    [custom],
  )

  // Cari definisi kategori (bawaan/kustom); fallback ke "Lainnya".
  const resolve = useCallback(
    (type, id) => {
      const defaults = categoriesFor(type)
      const found = custom.find((c) => c.id === id && c.type === type)
      if (found) return found
      const def = defaults.find((c) => c.id === id)
      if (def) return def
      return defaults.find((c) => c.id === 'lain') || defaults[defaults.length - 1]
    },
    [custom],
  )

  return { custom, loading, addCategory, updateCategory, removeCategory, allFor, resolve }
}

export default useCategoriesStore
