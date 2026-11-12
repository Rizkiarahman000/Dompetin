// ---------------------------------------------------------------------------
// expenseBuckets.js — mengelompokkan pengeluaran ke bucket waktu
// (harian / mingguan / bulanan) untuk grafik di Beranda.
// ---------------------------------------------------------------------------

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]
const MONTH_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export const PERIOD_LABEL = { day: 'hari', week: 'minggu', month: 'bulan' }

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + n)
  return d
}

// Senin sebagai awal minggu.
function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const sinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - sinceMonday)
  return d
}

function sum(list) {
  return list.reduce((total, t) => total + (Number(t.amount) || 0), 0)
}

// Kelompokkan item satu periode per kategori (untuk stacked bar).
function groupItems(items) {
  const map = new Map()
  for (const t of items) {
    const id = t.category
    map.set(id, (map.get(id) || 0) + (Number(t.amount) || 0))
  }
  const total = sum(items)
  return [...map.entries()]
    .map(([id, amount]) => ({
      id,
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function dayTitle(date) {
  return `${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`
}

function weekTitle(start, end) {
  const left = `${start.getDate()} ${MONTH_SHORT[start.getMonth()]}`
  const right = `${end.getDate()} ${MONTH_SHORT[end.getMonth()]}`
  return `${left} – ${right} ${end.getFullYear()}`
}

/**
 * @param {Array} transactions
 * @param {'day'|'week'|'month'} mode
 * @param {Date} nowInput
 */
export function buildExpenseBuckets(transactions, mode, nowInput = new Date()) {
  const now = new Date(nowInput.getFullYear(), nowInput.getMonth(), nowInput.getDate())
  const expenses = (transactions || []).filter((t) => t.type === 'expense' && t.date)
  const buckets = []

  if (mode === 'day') {
    for (let i = 13; i >= 0; i--) {
      const date = addDays(now, -i)
      const iso = toISO(date)
      const items = expenses
        .filter((t) => t.date === iso)
        .sort((a, b) => b.amount - a.amount)
      buckets.push({
        key: iso,
        label: String(date.getDate()),
        sublabel: DAY_SHORT[date.getDay()],
        title: dayTitle(date),
        start: iso,
        end: iso,
        total: sum(items),
        byCategory: groupItems(items),
        items,
      })
    }
    return buckets
  }

  if (mode === 'week') {
    const thisWeek = startOfWeek(now)
    for (let i = 7; i >= 0; i--) {
      const start = addDays(thisWeek, -7 * i)
      const end = addDays(start, 6)
      const startISO = toISO(start)
      const endISO = toISO(end)
      const items = expenses
        .filter((t) => t.date >= startISO && t.date <= endISO)
        .sort((a, b) => b.amount - a.amount)
      buckets.push({
        key: startISO,
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        sublabel: 'mgg',
        title: weekTitle(start, end),
        start: startISO,
        end: endISO,
        total: sum(items),
        byCategory: groupItems(items),
        items,
      })
    }
    return buckets
  }

  // month
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
    const items = expenses
      .filter((t) => (t.date || '').slice(0, 7) === key)
      .sort((a, b) => b.amount - a.amount)
    buckets.push({
      key,
      label: MONTH_SHORT[start.getMonth()],
      sublabel: i === 0 ? 'ini' : String(start.getFullYear()),
      title: `${MONTH_LONG[start.getMonth()]} ${start.getFullYear()}`,
      start: toISO(start),
      end: toISO(end),
      total: sum(items),
      byCategory: groupItems(items),
      items,
    })
  }
  return buckets
}

export default buildExpenseBuckets
