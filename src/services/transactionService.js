import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// transactionService — CRUD tabel `public.transactions` via Supabase PostgREST.
// ---------------------------------------------------------------------------

function normalize(row) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount) || 0,
    category: row.category,
    note: row.note || '',
    date: row.date,
    createdAt: row.created_at,
  }
}

function toPayload(t) {
  return {
    id: t.id,
    type: t.type,
    amount: Math.abs(Number(t.amount) || 0),
    category: t.category,
    note: (t.note || '').trim(),
    date: t.date,
  }
}

class TransactionService {
  async list() {
    const { data } = await apiClient.get('/transactions?select=*&order=date.desc,created_at.desc')
    return (Array.isArray(data) ? data : []).map(normalize)
  }

  // Upsert (insert atau update) berdasarkan primary key `id`.
  async upsertMany(rows) {
    if (!rows || rows.length === 0) return
    await apiClient.post('/transactions?on_conflict=id', rows.map(toPayload), {
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    })
  }

  async remove(id) {
    await apiClient.delete(`/transactions?id=eq.${encodeURIComponent(id)}`)
  }

  async removeAll() {
    await apiClient.delete('/transactions?id=not.is.null')
  }
}

export default new TransactionService()
