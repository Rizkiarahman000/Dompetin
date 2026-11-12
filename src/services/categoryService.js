import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// categoryService — CRUD tabel `public.categories` (kategori kustom) via
// Supabase PostgREST.
// ---------------------------------------------------------------------------

function normalize(row) {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    icon: row.icon || 'Tag',
    color: row.color || '#868e96',
    createdAt: row.created_at,
  }
}

function toPayload(c) {
  return {
    id: c.id,
    type: c.type,
    label: c.label,
    icon: c.icon,
    color: c.color,
  }
}

class CategoryService {
  async list() {
    const { data } = await apiClient.get('/categories?select=*&order=created_at.asc')
    return (Array.isArray(data) ? data : []).map(normalize)
  }

  async upsertMany(rows) {
    if (!rows || rows.length === 0) return
    await apiClient.post('/categories?on_conflict=id', rows.map(toPayload), {
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    })
  }

  async remove(id) {
    await apiClient.delete(`/categories?id=eq.${encodeURIComponent(id)}`)
  }
}

export default new CategoryService()
