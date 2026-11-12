// ---------------------------------------------------------------------------
// format.js — helper format angka & tanggal (locale Indonesia).
// ---------------------------------------------------------------------------

export function formatRupiah(value) {
  const n = Number(value) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatCompact(value) {
  const n = Number(value) || 0
  if (Math.abs(n) >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)} jt`
  if (Math.abs(n) >= 1_000) return `Rp${Math.round(n / 1_000)} rb`
  return `Rp${n}`
}

export function todayISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function relativeDate(iso) {
  if (!iso) return ''
  const today = todayISO()
  if (iso === today) return 'Hari ini'
  const d = new Date(iso + 'T00:00:00')
  const now = new Date(today + 'T00:00:00')
  const diff = Math.round((now - d) / 86_400_000)
  if (diff === 1) return 'Kemarin'
  if (diff > 1 && diff < 7) return `${diff} hari lalu`
  return formatDate(iso)
}

export function monthKey(iso) {
  return (iso || '').slice(0, 7)
}

export function currentMonthKey() {
  return todayISO().slice(0, 7)
}

export function monthLabel(key) {
  if (!key) return ''
  const [y, m] = key.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d)
}

export default {
  formatRupiah,
  formatCompact,
  todayISO,
  formatDate,
  relativeDate,
  monthKey,
  currentMonthKey,
  monthLabel,
}
