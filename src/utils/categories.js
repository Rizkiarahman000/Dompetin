// ---------------------------------------------------------------------------
// categories.js — daftar kategori pemasukan & pengeluaran beserta ikon
// (nama ikon lucide-react) dan warna aksen untuk tampilan.
// ---------------------------------------------------------------------------

export const EXPENSE_CATEGORIES = [
  { id: 'makan', label: 'Makan & Minum', icon: 'UtensilsCrossed', color: '#e8590c' },
  { id: 'transport', label: 'Transportasi', icon: 'Bus', color: '#1c7ed6' },
  { id: 'belanja', label: 'Belanja', icon: 'ShoppingBag', color: '#9c36b5' },
  { id: 'hiburan', label: 'Hiburan', icon: 'Gamepad2', color: '#f08c00' },
  { id: 'tagihan', label: 'Tagihan', icon: 'ReceiptText', color: '#0ca678' },
  { id: 'kesehatan', label: 'Kesehatan', icon: 'HeartPulse', color: '#e03131' },
  { id: 'lain', label: 'Lainnya', icon: 'Ellipsis', color: '#868e96' },
]

export const INCOME_CATEGORIES = [
  { id: 'gaji', label: 'Gaji / Uang Saku', icon: 'Wallet', color: '#0b7a5b' },
  { id: 'beasiswa', label: 'Beasiswa', icon: 'GraduationCap', color: '#1971c2' },
  { id: 'bonus', label: 'Bonus / Hadiah', icon: 'Gift', color: '#e8590c' },
  { id: 'jual', label: 'Penjualan', icon: 'Tag', color: '#7048e8' },
  { id: 'lain', label: 'Lainnya', icon: 'Ellipsis', color: '#868e96' },
]

export function categoriesFor(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function findCategory(type, id) {
  const list = categoriesFor(type)
  return list.find((c) => c.id === id) || list[list.length - 1]
}

export const TYPE_META = {
  income: { label: 'Pemasukan', sign: '+', color: '#0b7a5b' },
  expense: { label: 'Pengeluaran', sign: '−', color: '#d6336c' },
}

export default { EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoriesFor, findCategory, TYPE_META }
