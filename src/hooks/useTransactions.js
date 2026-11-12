import { useCallback, useEffect, useMemo, useState } from 'react'
import { readStore, writeStore, removeStore } from '../utils/storage'
import { currentMonthKey, monthKey, todayISO } from '../utils/format'

// ---------------------------------------------------------------------------
// useTransactions — sumber data tunggal untuk seluruh aplikasi.
//
// Skema satu transaksi:
//   { id, type: 'income'|'expense', amount, category, note, date, createdAt }
//
// Data dipersist ke localStorage sehingga CRUD & ringkasan tetap utuh saat
// offline maupun setelah aplikasi ditutup.
// ---------------------------------------------------------------------------

const STORE_KEY = 'transactions'
const SEED_FLAG = 'seeded'

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'tx-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function seedData() {
  return [
    { type: 'income', amount: 1500000, category: 'gaji', note: 'Uang saku bulanan', date: daysAgo(9) },
    { type: 'income', amount: 600000, category: 'beasiswa', note: 'Beasiswa prestasi', date: daysAgo(6) },
    { type: 'expense', amount: 45000, category: 'makan', note: 'Makan siang kampus', date: daysAgo(1) },
    { type: 'expense', amount: 25000, category: 'transport', note: 'Ojek ke kampus', date: daysAgo(1) },
    { type: 'expense', amount: 120000, category: 'belanja', note: 'Alat tulis & buku', date: daysAgo(3) },
    { type: 'expense', amount: 80000, category: 'hiburan', note: 'Nonton bareng teman', date: daysAgo(4) },
  ].map((t) => ({ ...t, id: uid(), createdAt: new Date().toISOString() }))
}

function loadInitial() {
  const stored = readStore(STORE_KEY, null)
  if (Array.isArray(stored)) return stored
  // Isi contoh sekali saja supaya tampilan pertama tidak kosong.
  if (!readStore(SEED_FLAG, false)) {
    const seeded = seedData()
    writeStore(STORE_KEY, seeded)
    writeStore(SEED_FLAG, true)
    return seeded
  }
  return []
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(loadInitial)

  useEffect(() => {
    writeStore(STORE_KEY, transactions)
  }, [transactions])

  const addTransaction = useCallback((data) => {
    const entry = {
      id: uid(),
      type: data.type,
      amount: Math.abs(Number(data.amount) || 0),
      category: data.category,
      note: (data.note || '').trim(),
      date: data.date || todayISO(),
      createdAt: new Date().toISOString(),
    }
    setTransactions((prev) => [entry, ...prev])
    return entry
  }, [])

  const updateTransaction = useCallback((id, data) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              type: data.type ?? t.type,
              amount: data.amount != null ? Math.abs(Number(data.amount) || 0) : t.amount,
              category: data.category ?? t.category,
              note: data.note != null ? data.note.trim() : t.note,
              date: data.date ?? t.date,
            }
          : t,
      ),
    )
  }, [])

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    setTransactions([])
    removeStore(SEED_FLAG)
  }, [])

  const stats = useMemo(() => {
    const thisMonth = currentMonthKey()
    let income = 0
    let expense = 0
    let monthIncome = 0
    let monthExpense = 0
    const byCategory = {}

    for (const t of transactions) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount

      if (monthKey(t.date) === thisMonth) {
        if (t.type === 'income') monthIncome += t.amount
        else {
          monthExpense += t.amount
          byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
        }
      }
    }

    return {
      income,
      expense,
      balance: income - expense,
      monthIncome,
      monthExpense,
      count: transactions.length,
      byCategory,
      thisMonth,
    }
  }, [transactions])

  return { transactions, addTransaction, updateTransaction, deleteTransaction, resetAll, stats }
}

export default useTransactions
