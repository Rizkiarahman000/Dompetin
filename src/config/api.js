import axios from 'axios'

// ---------------------------------------------------------------------------
// api.js — Supabase PostgREST client (pola sama seperti modul 5).
//
// Nilai di bawah bisa ditimpa lewat environment variable di Vercel:
//   VITE_API_BASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
// ---------------------------------------------------------------------------

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://pbngzienqipxluliaxgk.supabase.co'

export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_vLr2fsfXaxGXZikVKFpBEw_hDG6YjWT'

export const IS_SUPABASE = Boolean(API_BASE_URL && SUPABASE_KEY)

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/rest/v1`,
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 12000,
})

export default apiClient
